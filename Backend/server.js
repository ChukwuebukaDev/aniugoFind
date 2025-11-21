const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ---- API route for ORS directions ----
app.get("/route", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end" });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing ORS API key" });

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

    // Node 18+ built-in fetch
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ error: "ORS request failed", details: text });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
});

// ---- Serve React build ----
app.use(express.static(path.join(__dirname, "../build")));

// ---- Catch-all route for React ----
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// ---- Start server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend + React running on http://localhost:${PORT}`)
);
