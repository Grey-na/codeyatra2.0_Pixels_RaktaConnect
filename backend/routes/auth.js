const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, phone, password, role } = req.body;

    if(!username || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username,email,phone,password,role) VALUES (?,?,?,?,?)",
    [username, email, phone, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User Registered Successfully" });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  db.query(
    "SELECT * FROM users WHERE username=?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Internal server error" });

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } 
      );

      res.json({ 
        token, 
        role: user.role,
        message: "Login successful" 
      });
    }
  );
});
module.exports = router;