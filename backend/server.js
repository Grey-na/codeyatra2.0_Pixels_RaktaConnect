// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const fetch = require('node-fetch');
// const apiKey = process.env.GROQ_API_KEY;

// const nodemailer = require('nodemailer');

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json({ limit: '50mb' })); 
// app.use(express.static('public')); 

// const path = require('path');

// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/events", require("./routes/events"));
// app.use("/api/rewards", require("./routes/rewards"));

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

// app.use("/api/sos", require("./routes/sos"));

// app.post('/api/chat', async (req, res) => {
//   try {
//     const { message, history = [] } = req.body;

//     const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         model: 'llama-3.3-70b-versatile',
//         messages: [
//           { role: 'system', content: 'You are an Emergency AI Assistant. Provide calm, clear, step-by-step emergency guidance. Always recommend calling 911 for life-threatening situations.' },
//           ...history.slice(-10),
//           { role: 'user', content: message }
//         ]
//       })
//     });
//     const data = await response.json();
//     const reply = data.choices[0].message.content;
//     res.json({ reply });

//   } catch (error) {
//     console.error('Chat error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'chatbot.html'));
// });

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.get("/check", (req, res) => {
  res.send("Server is working");
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/rewards", require("./routes/rewards"));


app.use("/api/sos", require("./routes/sos"));
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});