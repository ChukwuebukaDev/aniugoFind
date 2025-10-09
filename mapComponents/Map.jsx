import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TextArea from "../components/TextAreaContainer";
import DisplayResult from "../components/DisplayResult";
import Points from "../components/Points";
import DisplayMatrix from "../components/DisplayMatrix";
import ZoomableMarker from "./MarkerComp";
import MapClickHandler from "./MapClickHandler";
import TextInputBtn from "../appBtnHandlers/TextInputBtn";
import MarkerBounce from "./MarkerBounce";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitMap({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const group = L.featureGroup(
        markers.map((m) => L.marker([m.lat, m.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }, [markers, map]);
  return null;
}

export default function CoordinateMap() {
  const [input, setInput] = useState("");
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);
  const [distanceMatrix, setDistanceMatrix] = useState([]);
  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [showInput, setShowInput] = useState(false); // 👈 new toggle state
  const updateInputFromPoints = (pointList) => {
    const newInput = pointList
      .map((p) => `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}, ${p.name}`)
      .join("\n");
    setInput(newInput);
  };

  const handleAddPoint = (point) => {
    const newPoints = [...points, point];
    setPoints(newPoints);
    updateInputFromPoints(newPoints);
  };

  const clearAll = useCallback(() => {
    setPoints([]);
    setResults(null);
    setDistanceMatrix([]);
    setInput("");
    setBouncingMarkers([]);
  }, []);

  const calculateResults = useCallback(
    (pointList) => {
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
          if (i === j) row.push(0);
          else {
            const dist = turf.distance(
              turf.point(coords[i]),
              turf.point(coords[j]),
              { units: "kilometers" }
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

      const bouncing = pointList.filter((p) =>
        closestPair.some(
          ([lng, lat]) =>
            Math.abs(lat - p.lat) < 1e-6 && Math.abs(lng - p.lng) < 1e-6
        )
      );
      setBouncingMarkers(bouncing.map((b) => b.name));
      setTimeout(() => setBouncingMarkers([]), 4000);

      setDistanceMatrix(matrix);
    },
    [setResults, setDistanceMatrix]
  );

  useEffect(() => {
    const timer = setTimeout(() => calculateResults(points), 300);
    return () => clearTimeout(timer);
  }, [points, calculateResults]);

  const isClosestMarker = useCallback(
    (p) =>
      results?.closestPair?.some(
        ([lng, lat]) =>
          Math.abs(lat - p.lat) < 1e-6 && Math.abs(lng - p.lng) < 1e-6
      ),
    [results]
  );

  return (
    <div className="w-full flex flex-col">
      <MarkerBounce />
      <TextInputBtn showInput={showInput} setShowInput={setShowInput} />
      {/* Collapsible TextArea with smooth transition */}
      <div
        className={`transition-all duration-800 overflow-hidden ${
          showInput ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-2">
          <TextArea
            input={input}
            setInput={setInput}
            setPoints={setPoints}
            calculateResults={calculateResults}
            clearAll={clearAll}
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="relative h-[65vh] min-h-[400px] rounded-lg overflow-hidden shadow-md">
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

          {points.map((p, idx) => {
            const isClosest = isClosestMarker(p);
            const isBouncing = bouncingMarkers.includes(p.name);
            return (
              <div
                key={idx}
                className={`${isBouncing ? "bounce" : ""}`}
                style={{ transformOrigin: "bottom center" }}
              >
                <ZoomableMarker point={p} isClosest={isClosest} />
              </div>
            );
          })}
        </MapContainer>
      </div>

      <Points
        points={points}
        setPoints={setPoints}
        updateInputFromPoints={updateInputFromPoints}
        calculateResults={calculateResults}
      />

      <DisplayResult results={results} />
      <DisplayMatrix
        distanceMatrix={distanceMatrix}
        points={points}
        results={results}
      />
    </div>
  );
}
