import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import * as turf from "@turf/turf";
import LocateUser from "./LocateUser";
import LocateControl from "./LocateControl";
import TextArea from "../components/TextAreaContainer";
import Points from "./Points";
import ZoomableMarker from "./MarkerComp";
import MarkerBounce from "./MarkerBounce";
import InfoCard from "./InfoCard";
import Spinner from "../components/Spinner";
import MapClickHandler from "./MapClickHandler";
import useDarkMode from "../Themes/useDarkMode";
import RoadRouting from "./RoadRouting";
import ClosestRoute from "./ClosestRoute";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

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
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(false);
  const [input, setInput] = useState("");
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);
  const [distanceMatrix, setDistanceMatrix] = useState([]);
  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [theme] = useDarkMode();

  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkUrl =
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    // Simulate map or data loading

    setTimeout(() => setLoading(false), 2000);
  }, []);

  const handleMapClick = () => {
    setInfo(true);
  };

  const handleClose = () => {
    setInfo((prev) => !prev);
  };

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

      // 🔹 New: Always find the closest to the *first point*
      const first = turf.point([coords[0][0], coords[0][1]]);
      let minDist = Infinity;
      let closestPoint = null;

      for (let i = 1; i < coords.length; i++) {
        const current = turf.point([coords[i][0], coords[i][1]]);
        const distance = turf.distance(first, current, { units: "kilometers" });

        if (distance < minDist) {
          minDist = distance;
          closestPoint = coords[i];
        }
      }

      const closestPair = [coords[0], closestPoint];

      // 🔹 Build full distance matrix (for your InfoCard)
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
          }
        }
        matrix.push(row);
      }

      setResults({ totalDistance, closestPair, minDist });

      // 🔹 Marker bounce for closest pair
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
    <>
      <Spinner loading={loading} />
      {!loading && (
        <div className="w-full h-full flex flex-col transition-colors duration-500 ease-in-out bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <MarkerBounce />

          <TextArea
            input={input}
            setInput={setInput}
            points={points}
            setPoints={setPoints}
            calculateResults={calculateResults}
            clearAll={clearAll}
          />

          <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              key={theme}
              center={[9.082, 8.6753]}
              zoom={6}
              className="h-full"
            >
              <TileLayer
                url={theme === "dark" ? darkUrl : lightUrl}
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              />

              <MapClickHandler
                handleMapClick={handleMapClick}
                setPoints={setPoints}
              />
              <LocateUser />
              <LocateControl points={points} setPoints={setPoints} />
              <FitMap markers={points} />

              {/* Blue route polyline */}
              {points.length > 1 && (
                <RoadRouting results={results} points={points} />
              )}
              {results?.closestPair && (
                <ClosestRoute closestPair={results.closestPair} />
              )}

              {/* Render markers */}
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
          {info && (
            <InfoCard
              formatDistance={formatDistance}
              results={results}
              onClose={handleClose}
              points={points}
            />
          )}
        </div>
      )}
    </>
  );
}
