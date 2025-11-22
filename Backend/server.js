const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch"); // IMPORTANT
require("dotenv").config();

const app = express();

// ---- Force CORS headers ----
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(cors());
app.use(express.json());

// ---- API route ----
app.get("/route", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end" });
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing ORS API key" });
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// ---- Serve React build ----
app.use(express.static(path.join(__dirname, "../dist")));

// ---- Catch-all for React Router ----
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// ---- Start server ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
