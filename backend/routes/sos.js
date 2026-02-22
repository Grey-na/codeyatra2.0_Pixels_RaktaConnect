const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");

// Configure the email transporter using your .env credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST: Create SOS Alert (Hospital or BloodBank only)
router.post("/send", authMiddleware, (req, res) => {
  const { role } = req.user;
  const { description, location, bloodTypeNeeded } = req.body;

  // Guard: Only Hospital or BloodBank can trigger SOS
  if (role !== "hospital" && role !== "bloodbank") {
    return res.status(403).json({ message: "Unauthorized to send SOS alerts" });
  }

  // 1. Save SOS to database for the record
  const sqlInsert = "INSERT INTO sos_alerts (creator_id, description, location, blood_type) VALUES (?, ?, ?, ?)";
  db.query(sqlInsert, [req.user.id, description, location, bloodTypeNeeded], (err) => {
    if (err) return res.status(500).json({ message: "Database error saving SOS" });

    // 2. Fetch all donor emails
    db.query("SELECT email FROM users WHERE role = 'donor'", (err2, donors) => {
      if (err2) return res.status(500).json({ message: "Error fetching donor list" });

      if (donors.length === 0) {
        return res.json({ message: "SOS saved, but no donors found to notify." });
      }

      const emailList = donors.map(d => d.email).join(",");

      // 3. Email Content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailList,
        subject: `🚨 EMERGENCY BLOOD SOS: ${bloodTypeNeeded} Needed!`,
        html: `
          <div style="font-family: Arial, sans-serif; border: 2px solid #ff0000; padding: 20px;">
            <h2 style="color: #ff0000;">Emergency Blood Requirement</h2>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Blood Type Needed:</strong> ${bloodTypeNeeded}</p>
            <p><strong>Details:</strong> ${description}</p>
            <hr>
            <p>Please contact the hospital immediately if you can donate. Your contribution can save a life.</p>
          </div>
        `
      };

      // 4. Send the Mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "SOS logged, but email failed to send." });
        }
        res.json({ message: "SOS Alert sent successfully to all donors!" });
      });
    });
  });
});

module.exports = router;