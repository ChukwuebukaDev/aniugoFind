import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TextArea from "../components/TextAreaContainer";
import CalculateAndClearBtn from "../components/TextBtn";
import DisplayResult from "../components/DisplayResult";
import Points from "../components/Points";
// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fit map to markers automatically
function FitMap({ markers }) {
  const map = useMap();
  React.useEffect(() => {
    if (markers.length > 0) {
      const group = L.featureGroup(
        markers.map((m) => L.marker([m.lat, m.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }, [markers, map]);
  return null;
}

// Handle click events on the map
function MapClickHandler({ onAdd }) {
  useMapEvents({
    click(e) {
      const name = prompt("Enter a name for this location (optional):") || "";
      onAdd({ ...e.latlng, name: name || `Point ${Date.now()}` });
    },
  });
  return null;
}

export default function CoordinateMap() {
  const [input, setInput] = useState("");
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);
  const [distanceMatrix, setDistanceMatrix] = useState([]);

  // Add a point (from map click)
  const handleAddPoint = (point) => {
    const newPoints = [...points, point];
    setPoints(newPoints);
    updateInputFromPoints(newPoints);
    calculateResults(newPoints);
  };

  // Parse manual input
  const handleCalculate = () => {
    try {
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const coords = lines.map((line, idx) => {
        const parts = line.split(",");
        if (parts.length < 2)
          throw new Error("Invalid format: use lat, lng, name(optional)");
        const [lat, lng, name] = parts.map((n) => n.trim());
        const parsed = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          name: name || `Point ${idx + 1}`,
        };
        if (isNaN(parsed.lat) || isNaN(parsed.lng))
          throw new Error(`Invalid coordinate: ${line}`);
        return parsed;
      });

      setPoints(coords);
      calculateResults(coords);
    } catch (err) {
      alert(err.message);
      clearAll();
    }
  };

  // Sync text input
  const updateInputFromPoints = (pointList) => {
    const newInput = pointList
      .map((p) => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}, ${p.name}`)
      .join("\n");
    setInput(newInput);
  };

  // Clear all
  const clearAll = () => {
    setPoints([]);
    setResults(null);
    setDistanceMatrix([]);
    setInput("");
  };

  // Delete a single point
  const deletePoint = (index) => {
    const updated = points.filter((_, i) => i !== index);
    setPoints(updated);
    updateInputFromPoints(updated);
    calculateResults(updated);
  };

  // Compute distances
  const calculateResults = (pointList) => {
    if (pointList.length < 2) {
      setResults(null);
      setDistanceMatrix([]);
      return;
    }

    const coords = pointList.map((p) => [p.lng, p.lat]);
    const line = turf.lineString(coords);
    const totalDistance = turf.length(line, { units: "kilometers" });

    let minDist = Infinity;
    let closestPair = [];
    const matrix = [];

    for (let i = 0; i < coords.length; i++) {
      const row = [];
      for (let j = 0; j < coords.length; j++) {
        if (i === j) {
          row.push(0);
        } else {
          const dist = turf.distance(
            turf.point(coords[i]),
            turf.point(coords[j]),
            {
              units: "kilometers",
            }
          );
          row.push(dist);
          if (dist < minDist) {
            minDist = dist;
            closestPair = [coords[i], coords[j]];
          }
        }
      }
      matrix.push(row);
    }

    setResults({ totalDistance, closestPair, minDist });
    setDistanceMatrix(matrix);
  };

  return (
    <div className="">
      <TextArea input={input} setInput={setInput} />
      {/* Calculate and Clear buttons */}
      <CalculateAndClearBtn
        handleCalculate={handleCalculate}
        clearAll={clearAll}
      />
      {/* Map */}
      <div style={{ height: "500px", marginTop: "10px" }}>
        <MapContainer
          center={[9.082, 8.6753]}
          zoom={6}
          style={{ height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onAdd={handleAddPoint} />
          <FitMap markers={points} />

          {points.length > 1 && (
            <Polyline
              positions={points.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#1976d2", weight: 4 }}
            />
          )}

          {results?.closestPair && (
            <Polyline
              positions={[
                [results.closestPair[0][1], results.closestPair[0][0]],
                [results.closestPair[1][1], results.closestPair[1][0]],
              ]}
              pathOptions={{ color: "red", weight: 5, dashArray: "5, 10" }}
            />
          )}

          {points.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]}>
              <Popup>
                <strong>{p.name}</strong>
                <br />
                {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Points List */}
      {points.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📍 Points</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {points.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f4f4f4",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  marginBottom: "5px",
                }}
              >
                <span>
                  <strong>{p.name}</strong> — {p.lat.toFixed(6)},{" "}
                  {p.lng.toFixed(6)}
                </span>
                <button
                  onClick={() => deletePoint(i)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d32f2f",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Points points={points} />
      {/* Results Section */}
      <DisplayResult results={results} />

      {/* Distance Matrix */}
      {distanceMatrix.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>📐 Distance Matrix (km)</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th></th>
                {points.map((p, idx) => (
                  <th key={idx}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distanceMatrix.map((row, i) => (
                <tr key={i}>
                  <th>{points[i].name}</th>
                  {row.map((dist, j) => (
                    <td
                      key={j}
                      style={{
                        border: "1px solid #ccc",
                        padding: "6px",
                        background:
                          i === j
                            ? "#f9f9f9"
                            : dist === results.minDist
                            ? "#ffd1d1"
                            : "white",
                      }}
                    >
                      {dist.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
