import { Router } from "express";
import { pool } from "../db.js";
import { authenticateJWT } from "../auth.js";

const router = Router();
router.use(authenticateJWT);

/** GET /api/mark-entries — fetch all entries */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mark_entries");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/** POST /api/mark-entries — insert or update with optimistic locking */
router.post("/", async (req, res) => {
  const { id, curriculum_id, sheet_id, student_id, score, version, device_name } = req.body;
  const user_id = req.user.id;

  try {
    const [existing] = await pool.query("SELECT * FROM mark_entries WHERE id = ?", [id]);

    if (existing.length === 0) {
      // Insert new
      await pool.query(
        `INSERT INTO mark_entries (id, curriculum_id, sheet_id, student_id, score, updated_by, device_name, version)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [id, curriculum_id, sheet_id, student_id, score ?? null, user_id, device_name ?? null]
      );
      return res.json({ status: "ok" });
    }

    const row = existing[0];
    if (row.version !== version) {
      // Version mismatch — check if scores differ (conflict)
      if (String(row.score ?? "") !== String(score ?? "")) {
        await pool.query(
          `INSERT INTO sync_conflicts
            (id, entity, entity_id, field, server_value, incoming_value, incoming_by, incoming_device, status)
           VALUES (?, 'mark', ?, 'score', ?, ?, ?, ?, 'pending')
           ON DUPLICATE KEY UPDATE
             server_value = VALUES(server_value), incoming_value = VALUES(incoming_value),
             incoming_by = VALUES(incoming_by), incoming_device = VALUES(incoming_device),
             status = 'pending'`,
          [
            `mark:${id}:score`,
            id,
            String(row.score ?? ""),
            String(score ?? ""),
            user_id,
            device_name ?? "device",
          ]
        );
        return res.json({ status: "conflict" });
      }
      return res.json({ status: "ok" });
    }

    // Version matches — safe update
    await pool.query(
      `UPDATE mark_entries
       SET score = ?, updated_by = ?, device_name = ?, version = version + 1
       WHERE id = ? AND version = ?`,
      [score ?? null, user_id, device_name ?? null, id, version]
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
