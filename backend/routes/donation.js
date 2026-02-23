const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/", authMiddleware, (req, res) => {
  // Only users with the 'donor' role can initiate a donation record
  if (req.user.role !== "donor") {
    return res.status(403).json({ message: "Only donors can register a donation" });
  }

  const { event_id, bank_id, blood_type } = req.body;

  // Basic validation to ensure blood type is provided
  if (!blood_type) {
    return res.status(400).json({ message: "Blood type is required" });
  }

  const insertQuery = `
    INSERT INTO donations (donor_id, event_id, bank_id, blood_type, status) 
    VALUES (?, ?, ?, ?, 'pending')
  `;

  db.query(
    insertQuery,
    [req.user.id, event_id || null, bank_id || null, blood_type],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error during registration", error: err });
      }
      res.status(201).json({ 
        message: "Donation registered successfully! It is now pending verification.",
        donationId: result.insertId 
      });
    }
  );
});


router.patch("/verify/:donationId", authMiddleware, (req, res) => {
  // 1. Authorization Check: Only allow Admin or NGO to verify donations
  if (req.user.role !== "admin" && req.user.role !== "ngo") {
    return res.status(403).json({ message: "Unauthorized: Only Admins or NGOs can verify donations" });
  }

  const donationId = req.params.donationId;

  // 2. Update the donation status to 'verified' and log the points awarded
  const verifyQuery = "UPDATE donations SET status = 'verified', points_awarded = 100 WHERE id = ?";

  db.query(verifyQuery, [donationId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error during verification", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation record not found" });
    }

    // 3. Automatically increment the donor's reward_points in the users table
    const updatePointsQuery = `
      UPDATE users 
      SET reward_points = reward_points + 100 
      WHERE id = (SELECT donor_id FROM donations WHERE id = ?)
    `;

    db.query(updatePointsQuery, [donationId], (err2) => {
      if (err2) {
        return res.status(500).json({ 
          message: "Donation verified, but failed to update user points", 
          error: err2 
        });
      }

      res.json({ 
        message: "Donation successfully verified! 100 points have been added to the donor's account." 
      });
    });
  });
});

module.exports = router;