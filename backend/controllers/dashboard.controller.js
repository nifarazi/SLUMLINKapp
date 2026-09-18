// backend/controllers/dashboard.controller.js
import db from "../db.js";

function asInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function getDashboardSummary(req, res) {
  try {
    const org_id = asInt(req.query.org_id);
    if (!org_id) return res.status(400).json({ message: "org_id is required" });

    // 1) Families helped = distinct family_code distributed by this org
    const [fhRows] = await db.query(
      `SELECT COUNT(DISTINCT family_code) AS families_helped
       FROM distribution_entries
       WHERE org_id = ?`,
      [org_id]
    );

    // 2) Areas covered = distinct slum_area from completed+in_progress campaigns
    const [areaRows] = await db.query(
      `SELECT COUNT(DISTINCT slum_area) AS areas_covered
       FROM campaigns
       WHERE org_id = ? AND status IN ('in_progress','completed') AND slum_area IS NOT NULL AND slum_area <> ''`,
      [org_id]
    );

    // 3) Completed campaigns
    const [completedRows] = await db.query(
      `SELECT COUNT(*) AS completed_campaigns
       FROM campaigns
       WHERE org_id = ? AND status = 'completed'`,
      [org_id]
    );

    // 4) Active campaigns = in_progress
    const [activeRows] = await db.query(
      `SELECT COUNT(*) AS active_campaigns
       FROM campaigns
       WHERE org_id = ? AND status = 'in_progress'`,
      [org_id]
    );

    res.json({
      data: {
        families_helped: fhRows?.[0]?.families_helped ?? 0,
        areas_covered: areaRows?.[0]?.areas_covered ?? 0,
        completed_campaigns: completedRows?.[0]?.completed_campaigns ?? 0,
        active_campaigns: activeRows?.[0]?.active_campaigns ?? 0,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getRecentDistributions(req, res) {
  try {
    const org_id = asInt(req.query.org_id);
    const limit = Math.min(Math.max(asInt(req.query.limit) || 5, 1), 20);

    if (!org_id) return res.status(400).json({ message: "org_id is required" });

    const [rows] = await db.query(
      `SELECT 
          s.session_id,
          s.campaign_id,
          s.status AS session_status,
          s.started_at,
          s.finished_at,
          c.title AS campaign_title,
          c.slum_area,
          COUNT(DISTINCT e.family_code) AS families_assisted
       FROM distribution_sessions s
       JOIN campaigns c ON c.campaign_id = s.campaign_id
       LEFT JOIN distribution_entries e ON e.session_id = s.session_id
       WHERE s.org_id = ?
       GROUP BY s.session_id, s.campaign_id, s.status, s.started_at, s.finished_at, c.title, c.slum_area
       ORDER BY COALESCE(s.finished_at, s.started_at) DESC
       LIMIT ?`,
      [org_id, limit]
    );

    res.json({ data: rows || [] });
  } catch (err) {
    console.error("getRecentDistributions error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getSessionFamilies(req, res) {
  try {
    const sessionId = Number(req.params.sessionId);
    const org_id = asInt(req.query.org_id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    const [sessRows] = await db.query(
      `SELECT
         s.session_id,
         s.campaign_id,
         s.org_id,
         s.status AS session_status,
         s.started_at,
         s.finished_at,
         s.performed_by,
         c.title AS campaign_title,
         c.slum_area,
         at.name AS aid_type
       FROM distribution_sessions s
       JOIN campaigns c ON c.campaign_id = s.campaign_id
       JOIN aid_types at ON at.aid_type_id = s.aid_type_id
       WHERE s.session_id = ?
       LIMIT 1`,
      [sessionId]
    );

    if (!sessRows.length) {
      return res.status(404).json({ message: "Session not found" });
    }

    const session = sessRows[0];

    if (org_id && Number(session.org_id) !== org_id) {
      return res.status(403).json({ message: "This session does not belong to your organization" });
    }

    const [familyRows] = await db.query(
      `SELECT
         e.family_code AS slum_code,
         sd.full_name AS family_head,
         sd.mobile,
         sd.area,
         sd.district,
         sd.division,
         COALESCE(sd.family_members, 0) AS family_members,
         e.quantity,
         e.comment,
         e.round_no,
         e.distributed_at
       FROM distribution_entries e
       LEFT JOIN slum_dwellers sd ON sd.slum_code = e.family_code
       WHERE e.session_id = ?
       ORDER BY e.distributed_at ASC, e.entry_id ASC`,
      [sessionId]
    );

    res.json({ data: { session, families: familyRows || [] } });
  } catch (err) {
    console.error("getSessionFamilies error:", err);
    res.status(500).json({ message: "Server error" });
  }
}