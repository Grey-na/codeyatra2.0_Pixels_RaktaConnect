const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// NGO Add Event
router.post("/", authMiddleware, (req, res) => {
  if (req.user.role !== "ngo")
    return res.status(403).json({ message: "Only NGO can add events" });

  const { event_name, description, location, google_form_link } = req.body;

  if (!event_name || !location || !google_form_link) {
    return res.status(400).json({ message: "Please provide all required fields (Name, Location, and Link)" });
  }

  db.query(
    "INSERT INTO events (ngo_id,event_name,description,location,google_form_link) VALUES (?,?,?,?,?)",
    [req.user.id, event_name, description, location, google_form_link],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Event Added Successfully" });
    }
  );
});

// Get All Events
router.get("/", (req, res) => {
  db.query("SELECT * FROM events", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;