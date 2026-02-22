const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin verify donation & add points
router.post("/verify/:id", authMiddleware, (req, res) => {
  // Guard 1: Role check
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const donationId = req.params.id;

  // Update donation status
  db.query(
    "UPDATE donations SET status='verified', points_awarded=50 WHERE id=?",
    [donationId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error updating donation" });
      
      // Check if the donation ID actually existed
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Donation record not found" });
      }

      // Update user points
      db.query(
        "UPDATE users u JOIN donations d ON u.id=d.donor_id SET u.reward_points=u.reward_points+50 WHERE d.id=?",
        [donationId],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Error rewarding points" });
          res.json({ message: "Donation verified and 50 points awarded successfully!" });
        }
      );
    }
  );
});

// Claim reward
router.post("/claim/:rewardId", authMiddleware, (req, res) => {
  const rewardId = req.params.rewardId;
  const userId = req.user.id;

  // 1. Get Reward Details
  db.query("SELECT * FROM rewards WHERE id=?", [rewardId], (err, rewardResults) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (rewardResults.length === 0) return res.status(404).json({ message: "Reward not found" });

    const reward = rewardResults[0];

    // 2. Check User Points
    db.query("SELECT reward_points FROM users WHERE id=?", [userId], (err2, userRes) => {
      if (err2) return res.status(500).json({ message: "Server error checking points" });
      
      const userPoints = userRes[0].reward_points;

      if (userPoints < reward.points_required) {
        return res.status(400).json({ 
          message: `Insufficient points. You need ${reward.points_required} but only have ${userPoints}.` 
        });
      }

      // 3. Subtract Points and Record Claim
      db.query(
        "UPDATE users SET reward_points = reward_points - ? WHERE id = ?",
        [reward.points_required, userId],
        (err3) => {
          if (err3) return res.status(500).json({ message: "Transaction failed" });

          db.query(
            "INSERT INTO claims (donor_id, reward_id) VALUES (?, ?)",
            [userId, rewardId],
            (err4) => {
              if (err4) return res.status(500).json({ message: "Logging claim failed" });
              
              res.json({ 
                message: "Reward claimed successfully!",
                remaining_points: userPoints - reward.points_required 
              });
            }
          );
        }
      );
    });
  });
});

module.exports = router;