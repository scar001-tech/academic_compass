import { Router } from "express";
import { pool } from "../db.js";
import { authenticateJWT } from "../auth.js";

const router = Router();
router.use(authenticateJWT);

/** GET /api/timetable-slots */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM timetable_slots");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/** POST /api/timetable-slots — upsert with optimistic locking */
router.post("/", async (req, res) => {
  const {
    id, curriculum_id, class_id, stream_id, day_of_week, period,
    start_time, end_time, subject_id, teacher_id, room, version, device_name,
  } = req.body;
  const user_id = req.user.id;

  try {
    const [existing] = await pool.query("SELECT * FROM timetable_slots WHERE id = ?", [id]);

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO timetable_slots
           (id, curriculum_id, class_id, stream_id, day_of_week, period,
            start_time, end_time, subject_id, teacher_id, room, version, updated_by, device_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [id, curriculum_id, class_id, stream_id ?? null, day_of_week, period,
         start_time ?? null, end_time ?? null, subject_id ?? null,
         teacher_id ?? null, room ?? null, user_id, device_name ?? null]
      );
      return res.json({ status: "ok" });
    }

    const row = existing[0];
    if (row.version !== version) {
      // Record conflicts for differing fields
      const fields = ["subject_id", "teacher_id", "room", "start_time", "end_time"];
      for (const f of fields) {
        if (String(row[f] ?? "") !== String(req.body[f] ?? "")) {
          await pool.query(
            `INSERT INTO sync_conflicts
               (id, entity, entity_id, field, server_value, incoming_value, incoming_by, incoming_device, status)
             VALUES (?, 'timetable', ?, ?, ?, ?, ?, ?, 'pending')
             ON DUPLICATE KEY UPDATE
               server_value = VALUES(server_value), incoming_value = VALUES(incoming_value),
               status = 'pending'`,
            [`timetable:${id}:${f}`, id, f,
             String(row[f] ?? ""), String(req.body[f] ?? ""), user_id, device_name ?? "device"]
          );
        }
      }
      return res.json({ status: "conflict" });
    }

    await pool.query(
      `UPDATE timetable_slots
       SET subject_id = ?, teacher_id = ?, room = ?,
           start_time = ?, end_time = ?,
           updated_by = ?, device_name = ?, version = version + 1
       WHERE id = ? AND version = ?`,
      [subject_id ?? null, teacher_id ?? null, room ?? null,
       start_time ?? null, end_time ?? null,
       user_id, device_name ?? null, id, version]
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/** DELETE /api/timetable-slots/:id */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM timetable_slots WHERE id = ?", [req.params.id]);
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
