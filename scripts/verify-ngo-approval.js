import db from "../backend/db.js";

const marker = `approval-check-${Date.now()}`;
let organizationId = null;

try {
  const [insertResult] = await db.query(
    `INSERT INTO organizations
      (org_type, org_name, email, phone, org_age, password,
       license_filename, license_mimetype, license_size, license_file)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "ngo",
      marker,
      `${marker}@example.invalid`,
      `test-${Date.now()}`,
      1,
      "not-a-real-password",
      "test.txt",
      "text/plain",
      4,
      Buffer.from("test"),
    ],
  );
  organizationId = insertResult.insertId;

  const response = await fetch(`http://127.0.0.1:5001/api/ngo/${organizationId}/approve`, {
    method: "PUT",
  });
  const body = await response.json();

  if (!response.ok || body.status !== "success") {
    throw new Error(`Approval endpoint returned HTTP ${response.status}`);
  }

  const [organizations] = await db.query(
    "SELECT status FROM organizations WHERE org_id = ?",
    [organizationId],
  );

  if (organizations[0]?.status !== "accepted") {
    throw new Error("Organization status was not updated to accepted");
  }

  console.log("Admin organization approval test passed without email credentials.");
} finally {
  if (organizationId) {
    await db.query("DELETE FROM organizations WHERE org_id = ?", [organizationId]);
  }
  await db.end();
}
