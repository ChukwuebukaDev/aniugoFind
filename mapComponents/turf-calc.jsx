import { useState } from "react";
import * as turf from "@turf/turf";

export default function CoordinateCalculator() {
  const [input, setInput] = useState("");
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);

  // Parse and compute distances
  const handleCalculate = () => {
    try {
      // Parse coordinates from textarea
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const coords = lines.map((line) => {
        const [lat, lng] = line.split(",").map((n) => parseFloat(n.trim()));
        if (isNaN(lat) || isNaN(lng))
          throw new Error("Invalid coordinate format");
        return [lng, lat]; // Turf uses [lng, lat] order
      });

      if (coords.length < 2)
        throw new Error("At least 2 coordinates are required");

      setPoints(coords.map(([lng, lat]) => ({ lat, lng })));

      // 🧮 Calculate total distance (in km)
      const line = turf.lineString(coords);
      const totalDistance = turf.length(line, { units: "kilometers" });

      // 🔍 Find closest pair
      let minDist = Infinity;
      let closestPair = [];

      for (let i = 0; i < coords.length; i++) {
        for (let j = i + 1; j < coords.length; j++) {
          const dist = turf.distance(
            turf.point(coords[i]),
            turf.point(coords[j]),
            {
              units: "kilometers",
            }
          );
          if (dist < minDist) {
            minDist = dist;
            closestPair = [coords[i], coords[j]];
          }
        }
      }

      setResults({
        totalDistance,
        closestPair,
        minDist,
      });
    } catch (err) {
      alert(err.message);
      setResults(null);
      setPoints([]);
    }
  };

  return (
    <div
      style={{ maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}
    >
      <h2>📍 Coordinate Distance Calculator</h2>
      <p>Enter one coordinate per line, e.g.:</p>
      <pre>51.505, -0.09</pre>
      <pre>51.51, -0.1</pre>
      <pre>51.515, -0.12</pre>

      <textarea
        rows="6"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter coordinates..."
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={handleCalculate}
        style={{
          padding: "10px 16px",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Calculate
      </button>

      {results && (
        <div style={{ marginTop: "20px" }}>
          <h3>🧮 Results</h3>
          <p>
            <strong>Total Distance:</strong> {results.totalDistance.toFixed(2)}{" "}
            km
          </p>
          <p>
            <strong>Closest Points:</strong>
            <br />
            Point A: {results.closestPair[0][1]}, {results.closestPair[0][0]}
            <br />
            Point B: {results.closestPair[1][1]}, {results.closestPair[1][0]}
            <br />
            <strong>Distance:</strong> {results.minDist.toFixed(3)} km
          </p>
        </div>
      )}
    </div>
  );
}
