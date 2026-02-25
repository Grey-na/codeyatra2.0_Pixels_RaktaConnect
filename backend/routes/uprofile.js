const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const q = `
    SELECT id, username, email, phone, role, age, blood_type, reward_points
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(q, [userId], (err, results) => {
    if (err) {
      console.error("[profile] DB error:", err);
      return res.status(500).json({ message: "DB error", error: err.sqlMessage });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(results[0]);
  });
});

module.exports = router;