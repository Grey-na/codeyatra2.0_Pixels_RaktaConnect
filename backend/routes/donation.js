const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// Create donation (DONOR only)
router.post("/", authMiddleware, (req, res) => {
  // 0) Guard: ensure JSON body exists (prevents destructuring crash)
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      message:
        "Request body is missing or invalid. Make sure you send JSON with Content-Type: application/json",
    });
  }

  // 1) Role check
  if (req.user?.role !== "donor") {
    return res
      .status(403)
      .json({ message: "Only donors can register a donation" });
  }

  // 2) Read payload (safe now)
  const { event_id = null, bank_id = null, blood_type } = req.body;

  // 3) Validate
  if (!blood_type || typeof blood_type !== "string") {
    return res.status(400).json({ message: "Blood type is required" });
  }

  // Optional: normalize
  const normalizedBloodType = blood_type.trim().toUpperCase();

  // 4) Insert
  const insertQuery = `
    INSERT INTO donations (donor_id, event_id, bank_id, blood_type, status) 
    VALUES (?, ?, ?, ?, 'pending')
  `;

  db.query(
    insertQuery,
    [req.user.id, event_id, bank_id, normalizedBloodType],
    (err, result) => {
      if (err) {
        console.error("[donations] insert error:", err);
        return res.status(500).json({
          message: "Database error during registration",
          error: err,
        });
      }

      return res.status(201).json({
        message:
          "Donation registered successfully! It is now pending verification.",
        donationId: result.insertId,
      });
    }
  );
});

// Verify donation (ADMIN/NGO only)
router.patch("/verify/:donationId", authMiddleware, (req, res) => {
  // 1) Role check
  if (req.user?.role !== "admin" && req.user?.role !== "ngo") {
    return res.status(403).json({
      message: "Unauthorized: Only Admins or NGOs can verify donations",
    });
  }

  const donationId = req.params.donationId;

  if (!donationId) {
    return res.status(400).json({ message: "donationId is required" });
  }

  // 2) Update donation status
  const verifyQuery =
    "UPDATE donations SET status = 'verified', points_awarded = 100 WHERE id = ?";

  db.query(verifyQuery, [donationId], (err, result) => {
    if (err) {
      console.error("[donations] verify update error:", err);
      return res.status(500).json({
        message: "Database error during verification",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation record not found" });
    }

    // 3) Update user's reward points
    const updatePointsQuery = `
      UPDATE users 
      SET reward_points = reward_points + 100 
      WHERE id = (SELECT donor_id FROM donations WHERE id = ?)
    `;

    db.query(updatePointsQuery, [donationId], (err2) => {
      if (err2) {
        console.error("[donations] points update error:", err2);
        return res.status(500).json({
          message: "Donation verified, but failed to update user points",
          error: err2,
        });
      }

      return res.json({
        message:
          "Donation successfully verified! 100 points have been added to the donor's account.",
      });
    });
  });
});

module.exports = router;