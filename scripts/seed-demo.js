import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import db from "../backend/db.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(scriptDirectory, "..", "supabase", "seed.sql");

try {
  const sql = await readFile(seedPath, "utf8");
  await db.raw.query(sql);

  const summary = await db.raw.query(`
    select 'organizations' as table_name, count(*)::int as total from organizations
    union all select 'slum_dwellers', count(*)::int from slum_dwellers
    union all select 'spouses', count(*)::int from spouses
    union all select 'children', count(*)::int from children
    union all select 'documents', count(*)::int from documents
    union all select 'complaints', count(*)::int from complaints
    union all select 'campaigns', count(*)::int from campaigns
    union all select 'notifications', count(*)::int from notifications
    union all select 'distribution_sessions', count(*)::int from distribution_sessions
    union all select 'distribution_entries', count(*)::int from distribution_entries
  `);

  console.log("Synthetic demo data is ready:");
  for (const row of summary.rows) {
    console.log(`  ${row.table_name}: ${row.total}`);
  }
} catch (error) {
  console.error("Demo seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
