const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");

// Gmail transporter (use App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional: verify transporter at startup
transporter.verify((err, success) => {
  if (err) console.error("[SOS] Email transporter error:", err);
  else console.log("[SOS] Email transporter ready");
});

router.post("/send", authMiddleware, (req, res) => {
  const role = req.user?.role;
  const creatorId = req.user?.id;

  const { description, location, bloodTypeNeeded } = req.body;

  //Only hospital or bloodbank
  if (role !== "hospital" && role !== "bloodbank") {
    return res.status(403).json({ message: "Unauthorized to send SOS alerts" });
  }

  //Validate body
  if (!description || !location || !bloodTypeNeeded) {
    return res.status(400).json({ message: "description, location, bloodTypeNeeded are required" });
  }

  // 1) Save SOS record
  const sqlInsert =
    "INSERT INTO sos_alerts (creator_id, description, location, blood_type) VALUES (?, ?, ?, ?)";

  db.query(sqlInsert, [creatorId, description, location, bloodTypeNeeded], (err) => {
    if (err) {
      console.error("[SOS] DB insert error:", err);
      return res.status(500).json({ message: "Database error saving SOS", error: err.sqlMessage });
    }

    // 2) Fetch donor emails
    db.query(
      "SELECT email FROM users WHERE role = 'donor' AND email IS NOT NULL AND email <> ''",
      (err2, donors) => {
        if (err2) {
          console.error("[SOS] donor fetch error:", err2);
          return res.status(500).json({ message: "Error fetching donor list", error: err2.sqlMessage });
        }

        if (!donors || donors.length === 0) {
          return res.json({ message: "SOS saved, but no donor emails found to notify." });
        }

        const bccList = donors.map((d) => d.email);

        // 3) Email content
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,      // to yourself (required by some providers)
          bcc: bccList,                    // donors hidden
          subject: `🚨 EMERGENCY BLOOD SOS: ${bloodTypeNeeded} Needed!`,
          html: `
            <div style="font-family: Arial, sans-serif; border: 2px solid #ff0000; padding: 20px;">
              <h2 style="color: #ff0000;">Emergency Blood Requirement</h2>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Blood Type Needed:</strong> ${bloodTypeNeeded}</p>
              <p><strong>Details:</strong> ${description}</p>
              <hr>
              <p>Please contact the hospital/blood bank immediately if you can donate. Your contribution can save a life.</p>
            </div>
          `,
        };

        // 4) Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("[SOS] sendMail error:", error);
            return res.status(500).json({
              message: "SOS logged, but email failed to send.",
              error: error.message,
            });
          }

          return res.json({
            message: `SOS Alert sent successfully to ${bccList.length} donors!`,
            info: info.response,
          });
        });
      }
    );
  });
});

module.exports = router;