const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/claim/:rewardId", authMiddleware, (req, res) => {
  const rewardId = req.params.rewardId;
  const userId = req.user.id;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction error" });

    db.query("SELECT * FROM rewards WHERE id=?", [rewardId], (err1, rewardResults) => {
      if (err1 || rewardResults.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ message: "Reward not found" });
        });
      }

      const reward = rewardResults[0];

      db.query("SELECT reward_points FROM users WHERE id=?", [userId], (err2, userRes) => {
        if (err2 || userRes.length === 0) {
          return db.rollback(() => {
            res.status(500).json({ message: "User not found" });
          });
        }

        const userPoints = userRes[0].reward_points;

        if (userPoints < reward.points_required) {
          return db.rollback(() => {
            res.status(400).json({
              message: `Insufficient points. You need ${reward.points_required} but only have ${userPoints}.`
            });
          });
        }

        db.query(
          "UPDATE users SET reward_points = reward_points - ? WHERE id = ?",
          [reward.points_required, userId],
          (err3) => {
            if (err3) {
              return db.rollback(() => {
                res.status(500).json({ message: "Failed to deduct points" });
              });
            }

            db.query(
              "INSERT INTO claims (donor_id, reward_id) VALUES (?, ?)",
              [userId, rewardId],
              (err4) => {
                if (err4) {
                  return db.rollback(() => {
                    res.status(500).json({ message: "Failed to log claim" });
                  });
                }

                db.commit((err5) => {
                  if (err5) {
                    return db.rollback(() => {
                      res.status(500).json({ message: "Commit failed" });
                    });
                  }

                  res.json({
                    message: "Reward claimed successfully!",
                    remaining_points: userPoints - reward.points_required
                  });
                });
              }
            );
          }
        );
      });
    });
  });
});

module.exports = router;