const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load JSON data with error handling
let repertoireData;
try {
  repertoireData = require("./repertoire.json"); // Make sure the file is in the same directory as server.js
  console.log("Repertoire data loaded successfully");
} catch (err) {
  console.error("Error loading repertoire.json:", err);
  // Provide fallback data to prevent server crash
  repertoireData = { "Үлкен топ": [], "Кіші топ": [] };
}

// API endpoint for serving repertoire data
app.get("/api/repertoire", (req, res) => {
  try {
    res.json(repertoireData);
  } catch (err) {
    console.error("Error serving repertoire data:", err);
    res.status(500).send("Error serving repertoire data");
  }
});

// API endpoint for searching people who know a piece
app.get("/api/search", (req, res) => {
  const piece = req.query.piece?.toLowerCase() || "";
  const count = parseInt(req.query.count) || 1000;

  try {
    const results = [];
    
    // Search in both groups
    for (const group in repertoireData) {
      for (const participant of repertoireData[group]) {
        // Check if participant knows the piece
        if (participant["Репертуар"].some(p => p.toLowerCase().includes(piece))) {
          results.push({ name: participant["Есім"] });
          // Limit results if count is specified
          if (results.length >= count) {
            break;
          }
        }
      }
      // Break outer loop too if we have enough results
      if (results.length >= count) {
        break;
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).send("Error during search");
  }
});

// API endpoint for getting all pieces
app.get("/api/pieces", (req, res) => {
  try {
    // Get all unique pieces
    const pieces = new Set();
    for (const group in repertoireData) {
      for (const participant of repertoireData[group]) {
        participant["Репертуар"].forEach(piece => pieces.add(piece));
      }
    }
    
    const result = Array.from(pieces).map(title => ({ title }));
    res.json(result);
  } catch (err) {
    console.error("Error fetching pieces:", err);
    res.status(500).send("Error fetching pieces");
  }
});

// Serve frontend for all non-API routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all route for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});