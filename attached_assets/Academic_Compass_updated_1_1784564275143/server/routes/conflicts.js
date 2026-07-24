import { Router } from "express";
import { pool } from "../db.js";
import { authenticateJWT } from "../auth.js";

const router = Router();
router.use(authenticateJWT);

/** GET /api/conflicts?status=pending */
router.get("/", async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const [rows] = await pool.query(
      "SELECT * FROM sync_conflicts WHERE status = ? ORDER BY created_at DESC",
      [status]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/** PATCH /api/conflicts/:id — resolve */
router.patch("/:id", async (req, res) => {
  const { resolution, custom_value } = req.body;
  try {
    await pool.query(
      `UPDATE sync_conflicts
       SET status = 'resolved', resolution = ?, custom_value = ?, resolved_at = NOW()
       WHERE id = ?`,
      [resolution, custom_value ?? null, req.params.id]
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
