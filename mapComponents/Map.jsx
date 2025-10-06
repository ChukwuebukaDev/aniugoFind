import React, { useState, useEffect } from "react";
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
import DisplayMatrix from "../components/DisplayMatrix";
import ZoomableMarker from "./MarkerComp";
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
          {results && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255,255,255,0.9)",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                zIndex: 1000,
              }}
            >
              Total Distance: {results.totalDistance.toFixed(2)} km
            </div>
          )}

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

          {points.map((p, idx) => {
            const isClosest =
              results?.closestPair &&
              results.closestPair.some(
                ([lng, lat]) => lat === p.lat && lng === p.lng
              );

            return <ZoomableMarker key={idx} point={p} isClosest={isClosest} />;
          })}
        </MapContainer>
      </div>

      {/* Points List */}
      <Points
        points={points}
        setPoints={setPoints}
        updateInputFromPoints={updateInputFromPoints}
        calculateResults={calculateResults}
      />

      {/* Results Section */}
      <DisplayResult results={results} />

      {/* Distance Matrix */}
      <DisplayMatrix
        distanceMatrix={distanceMatrix}
        points={points}
        results={results}
      />
    </div>
  );
}
