const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const fetch = require("node-fetch");
const path = require("path");
const groqApiKey = process.env.GROQ_API_KEY;
const donationRoutes = require("./routes/donation");
const rewardRoutes = require("./routes/rewards");

const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

const backendDir = __dirname;
const parentDir = path.dirname(backendDir);
const frontendDir = path.join(parentDir, "frontend");
const uprofileRoutes = require("./routes/uprofile");
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", uprofileRoutes);
app.use("/api/sos", require("./routes/sos1"));
app.use("/api/rewards", rewardRoutes);
app.use("/api/donations", donationRoutes);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "backend", "public")));

app.use("/static", express.static(path.join(__dirname, "frontend")));

app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use("/api/donations", donationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/rewards", require("./routes/rewards"));
app.use("/api/sos", require("./routes/sos1"));

app.post("/api/chat", async (req, res) => {
  try {
    console.log("[DEBUG] Entering /api/chat route handler");
    const { message, history = [], systemPrompt } = req.body;

    console.log("Payload Check:", {
      hasMessage: !!message,
      historyLength: history.length,
      hasSystemPrompt: !!systemPrompt,
      systemPromptPreview: systemPrompt
        ? systemPrompt.substring(0, 50) + "..."
        : "N/A",
      systemPromptLength: systemPrompt ? systemPrompt.length : 0,
    });

    if (!message && history.length === 0) {
      return res.status(400).json({ reply: "Message content is empty." });
    }

    if (!groqApiKey) {
      console.error("Groq API key is missing!");
      return res
        .status(500)
        .json({ reply: "API configuration error. Please contact support." });
    }

    console.log("Attempting Groq API call...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Using a current supported Groq model
          messages: [
            {
              role: "system",
              content:
                systemPrompt ||
                "Assist users with blood donation registration, urgent blood requests, donor eligibility checks, and locating nearby blood banks across Nepal. In emergencies, instruct users to call 102 or the nearest hospital immediately. Provide structured step-by-step guidance for blood-related services.",
            },
            ...history.slice(-10), // Use the last 10 messages for context
            { role: "user", content: message },
          ],
        }),
      },
    );

    console.log("Groq API Response Status:", response.status);
    console.log(
      "Groq API Response Headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", response.status, errorText);
      console.error(
        "Request payload:",
        JSON.stringify(
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  systemPrompt ||
                  "Assist users with blood donation registration, urgent blood requests, donor eligibility checks, and locating nearby blood banks across Nepal. In emergencies, instruct users to call 102 or the nearest hospital immediately. Provide structured step-by-step guidance for blood-related services.",
              },
              ...history.slice(-10),
              { role: "user", content: message },
            ],
          },
          null,
          2,
        ),
      );

      // If API fails, provide a contextual fallback response
      const fallbackResponse = `I understand you're asking about: "${message}". I'm here to help with blood donation services in Nepal. For specific assistance, please try rephrasing your question about blood donation, urgent requests, donor eligibility, or finding nearby blood banks.`;
      const reply = fallbackResponse;
      res.json({ reply });
      return;
    }

    const data = await response.json();
    console.log("Groq API Response Data:", data);
    // Safely access the reply from the AI's response
    const reply = data.choices?.[0]?.message?.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatbot.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
