import fs from "node:fs/promises";
import path from "node:path";
import { Workbook } from "@oai/artifact-tool";

const projectRoot = "C:/SLUMLINK-ict-innovation";
const outputDir = path.join(projectRoot, "supabase", "csv-demo");
const sql = await fs.readFile(path.join(projectRoot, "supabase", "seed.sql"), "utf8");

function splitTopLevel(text) {
  const values = [];
  let start = 0;
  let depth = 0;
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "'" && quoted && text[i + 1] === "'") {
      i += 1;
      continue;
    }
    if (char === "'") quoted = !quoted;
    if (quoted) continue;
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      values.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  values.push(text.slice(start).trim());
  return values.filter(Boolean);
}

function decodeSqlValue(token) {
  const value = token.trim();
  if (/^null$/i.test(value)) return "";
  if (/^(true|false)$/i.test(value)) return value.toLowerCase();
  if (/^-?\d+(\.\d+)?$/.test(value)) return value;
  const converted = value.match(/^convert_to\('((?:''|[^'])*)'\s*,\s*'UTF8'\)$/i);
  if (converted) {
    return "\\x" + Buffer.from(converted[1].replaceAll("''", "'"), "utf8").toString("hex");
  }
  const castValue = value.replace(/::[a-z ]+$/i, "");
  if (castValue.startsWith("'") && castValue.endsWith("'")) {
    return castValue.slice(1, -1).replaceAll("''", "'");
  }
  throw new Error(`Unsupported SQL seed value: ${value}`);
}

function rowsFromInsert(tableName) {
  const statements = sql.split(/;\s*(?:\r?\n|$)/);
  for (const statement of statements) {
    const table = statement.match(/^\s*insert into\s+(?:public\.)?([a-z_]+)/i)?.[1];
    if (table !== tableName) continue;
    const match = statement.match(/insert into\s+(?:public\.)?[a-z_]+\s*\(([\s\S]*?)\)\s*values\s*([\s\S]*?)\s*on conflict/i);
    if (!match) continue;
    const headers = splitTopLevel(match[1]).map((item) => item.trim());
    const tuples = splitTopLevel(match[2]);
    const rows = tuples.map((tuple) => {
      const values = splitTopLevel(tuple.replace(/^\(/, "").replace(/\)$/, "")).map(decodeSqlValue);
      if (values.length !== headers.length) {
        throw new Error(`${tableName}: expected ${headers.length} values, found ${values.length}`);
      }
      return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
    });
    return { headers, rows };
  }
  throw new Error(`No VALUES insert found for ${tableName}`);
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function writeCsv(fileName, headers, rows) {
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\r\n") + "\r\n";
  await fs.writeFile(path.join(outputDir, fileName), csv, "utf8");
  const workbook = await Workbook.fromCSV(csv, { sheetName: "Import" });
  const used = workbook.worksheets.getItem("Import").getUsedRange();
  const actualRows = used.values.length - 1;
  if (actualRows !== rows.length) {
    throw new Error(`${fileName}: validation expected ${rows.length} rows, found ${actualRows}`);
  }
  return rows.length;
}

await fs.mkdir(outputDir, { recursive: true });

const extracted = {};
for (const table of [
  "organizations", "slum_dwellers", "spouses", "children", "complaints",
  "campaigns", "campaign_targets", "distribution_entries",
]) {
  extracted[table] = rowsFromInsert(table);
}

const dwellers = extracted.slum_dwellers.rows;
const documentHeaders = [
  "id", "slum_id", "document_type", "document_title", "file_blob",
  "file_mimetype", "file_size", "status", "uploaded_at", "reviewed_by",
  "reviewed_at", "rejection_reason",
];
const documents = dwellers.map((resident, index) => {
  const approved = resident.status === "accepted";
  const rejected = resident.status === "rejected";
  return {
    id: String(900001 + index),
    slum_id: resident.slum_code,
    document_type: Number(resident.id) % 3 === 0 ? "Skills Certificate" : Number(resident.id) % 2 === 0 ? "Utility Bill" : "National ID",
    document_title: Number(resident.id) % 3 === 0 ? "Verified skills record" : Number(resident.id) % 2 === 0 ? "Residence verification" : "Household identity record",
    file_blob: "\\x" + Buffer.from("Synthetic demo document - not valid").toString("hex"),
    file_mimetype: "text/plain",
    file_size: "35",
    status: approved ? "approved" : rejected ? "rejected" : "pending",
    uploaded_at: resident.created_at,
    reviewed_by: approved || rejected ? "SLUMLINK Admin" : "",
    reviewed_at: approved || rejected ? resident.created_at : "",
    rejection_reason: rejected ? "The uploaded copy was incomplete." : "",
  };
});

const campaignById = new Map(extracted.campaigns.rows.map((row) => [row.campaign_id, row]));
const notificationHeaders = ["notification_id","slum_code","campaign_id","org_id","type","title","message","is_read","created_at"];
const notifications = extracted.campaign_targets.rows.map((target, index) => {
  const campaign = campaignById.get(target.campaign_id);
  const cancelled = campaign.status === "cancelled";
  return {
    notification_id: String(900001 + index),
    slum_code: target.slum_code,
    campaign_id: target.campaign_id,
    org_id: campaign.org_id,
    type: cancelled ? "campaign_cancelled" : "campaign_created",
    title: cancelled ? "Campaign cancelled" : "New campaign matched your household",
    message: cancelled ? `${campaign.title} has been cancelled.` : `Your household matched: ${campaign.title}.`,
    is_read: ["900001", "900007"].includes(target.campaign_id) ? "true" : "false",
    created_at: target.matched_at,
  };
});

const sessionHeaders = ["session_id","campaign_id","org_id","aid_type_id","status","started_at","finished_at","performed_by"];
const sessions = [
  ["900001","900001","900001","1","CLOSED","2026-08-05T09:05:00+06:00","2026-08-05T13:40:00+06:00","Nusrat Chowdhury"],
  ["900002","900001","900001","4","CLOSED","2026-08-06T10:00:00+06:00","2026-08-06T12:30:00+06:00","Mahmud Hasan"],
  ["900003","900007","900003","3","CLOSED","2026-08-20T11:10:00+06:00","2026-08-20T14:00:00+06:00","Dr. Samia Rahman"],
  ["900004","900002","900002","5","OPEN","2026-09-10T10:05:00+06:00","","Farhana Islam"],
  ["900005","900003","900003","3","OPEN","2026-09-14T08:35:00+06:00","","Health Camp Team"],
].map((values) => Object.fromEntries(sessionHeaders.map((header, index) => [header, values[index]])));

const residentCodes = new Set(dwellers.map((row) => row.slum_code));
const organizationIds = new Set(extracted.organizations.rows.map((row) => row.org_id));
const campaignIds = new Set(extracted.campaigns.rows.map((row) => row.campaign_id));
const sessionIds = new Set(sessions.map((row) => row.session_id));

function requireReferences(rows, field, allowed, label) {
  for (const row of rows) {
    if (!allowed.has(row[field])) {
      throw new Error(`${label}: ${field} ${row[field]} has no matching parent row`);
    }
  }
}

for (const [label, rows, field] of [
  ["spouses", extracted.spouses.rows, "slum_id"],
  ["children", extracted.children.rows, "slum_id"],
  ["documents", documents, "slum_id"],
  ["complaints", extracted.complaints.rows, "slum_id"],
  ["campaign targets", extracted.campaign_targets.rows, "slum_code"],
  ["notifications", notifications, "slum_code"],
  ["distribution entries", extracted.distribution_entries.rows, "family_code"],
]) {
  requireReferences(rows, field, residentCodes, label);
}
requireReferences(extracted.campaigns.rows, "org_id", organizationIds, "campaigns");
requireReferences(extracted.campaign_targets.rows, "campaign_id", campaignIds, "campaign targets");
requireReferences(notifications, "campaign_id", campaignIds, "notifications");
requireReferences(sessions, "campaign_id", campaignIds, "distribution sessions");
requireReferences(extracted.distribution_entries.rows, "campaign_id", campaignIds, "distribution entries");
requireReferences(extracted.distribution_entries.rows, "session_id", sessionIds, "distribution entries");

for (const [label, rows, field] of [
  ["organizations", extracted.organizations.rows, "org_id"],
  ["residents", dwellers, "id"],
  ["spouses", extracted.spouses.rows, "id"],
  ["children", extracted.children.rows, "id"],
  ["documents", documents, "id"],
  ["complaints", extracted.complaints.rows, "complaint_id"],
  ["campaigns", extracted.campaigns.rows, "campaign_id"],
  ["notifications", notifications, "notification_id"],
  ["distribution sessions", sessions, "session_id"],
  ["distribution entries", extracted.distribution_entries.rows, "entry_id"],
]) {
  const values = rows.map((row) => row[field]);
  if (new Set(values).size !== values.length) {
    throw new Error(`${label}: duplicate ${field}`);
  }
}

const outputs = [
  ["01_organizations.csv", extracted.organizations.headers, extracted.organizations.rows],
  ["02_slum_dwellers.csv", extracted.slum_dwellers.headers, extracted.slum_dwellers.rows],
  ["03_spouses.csv", extracted.spouses.headers, extracted.spouses.rows],
  ["04_children.csv", extracted.children.headers, extracted.children.rows],
  ["05_documents.csv", documentHeaders, documents],
  ["06_complaints.csv", extracted.complaints.headers, extracted.complaints.rows],
  ["07_campaigns.csv", extracted.campaigns.headers, extracted.campaigns.rows],
  ["08_campaign_targets.csv", extracted.campaign_targets.headers, extracted.campaign_targets.rows],
  ["09_notifications.csv", notificationHeaders, notifications],
  ["10_distribution_sessions.csv", sessionHeaders, sessions],
  ["11_distribution_entries.csv", extracted.distribution_entries.headers, extracted.distribution_entries.rows],
];

const counts = [];
for (const [fileName, headers, rows] of outputs) {
  counts.push([fileName, await writeCsv(fileName, headers, rows)]);
}

const readme = `SLUMLINK Supabase demo CSV pack

All records are fictional and intended only for screenshots and development.

Upload in this exact order:
${outputs.map(([name], index) => `${index + 1}. ${name}`).join("\n")}

In Supabase: Table Editor > select the matching table > Insert > Import data from CSV.
Use the table name after the numeric prefix. Keep "First row is header" enabled.
Do not upload these files twice unless you first remove the earlier demo rows with IDs 900001 and above.

The aid_types table is intentionally omitted. The migration already creates:
1 Food, 2 Clothing, 3 Medicine, 4 Cash, 5 Skill Training, 6 Job Placement.

Demo resident login: SR900001 / ResidentDemo@123
Demo NGO login: contact@alorpoth-demo.example / NgoDemo@123
`;
await fs.writeFile(path.join(outputDir, "README.txt"), readme, "utf8");
console.log(counts.map(([name, count]) => `${name}: ${count} rows`).join("\n"));
