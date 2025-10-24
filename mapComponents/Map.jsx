// 🔹 React & React Hooks
import { useState, useCallback, useEffect } from "react";
// 🔹 React-Leaflet Core
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
// 🔹 Components – Map Logic
import {
  LocateUser,
  LocateControl,
  RoadRouting,
  ClosestRoute,
  MapClickHandler,
  ZoomableMarker,
  MarkerBounce,
  Fitmap,
} from "../mapComponents";

// 🔹 Components – UI
import TextArea from "../components/TextAreaContainer";
import PointsDisplay from "../utilities/Notifications/PointsDisplay";
import Spinner from "../components/Spinner";
// 🔹 Hooks & Themes
import useDarkMode from "../Themes/useDarkMode";
import { button } from "framer-motion/client";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CoordinateMap() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(false);
  const [input, setInput] = useState("");
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);
  const [closePoints, setClosePoints] = useState(true);
  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [theme] = useDarkMode();

  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);
  const handleClosePoints = () => {
    setClosePoints((prev) => !prev);
  };
  const handleMapClick = () => setInfo(true);
  const handleClose = () => setClosePoints((prev) => !prev);
  const deletePoint = (index) => {
    const newPoints = points.filter((points, i) => index !== i);
    setPoints(newPoints);
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
  const zoomToPoint = (lat, lng) => {
    const map = useMap();
    map.setView([lat, lng], 13, { animate: true });
  };

  const clearAll = useCallback(() => {
    setPoints([]);
    setResults(null);
    setInput("");
    setBouncingMarkers([]);
  }, []);

  const calculateResults = useCallback(
    (pointList) => {
      if (pointList.length < 2) {
        setResults(null);
        return;
      }

      // 🔹 Find closest to first point
      const first = pointList[0];
      let closestPoint = null;
      let minDist = Infinity;

      for (let i = 1; i < pointList.length; i++) {
        const p = pointList[i];
        const dx = first.lat - p.lat;
        const dy = first.lng - p.lng;
        const dist = Math.sqrt(dx * dx + dy * dy); // simple straight-line
        if (dist < minDist) {
          minDist = dist;
          closestPoint = p;
        }
      }

      const closestPair = [first, closestPoint];

      // 🔹 Marker bounce for closest pair
      const bouncing = pointList.filter((p) =>
        closestPair.some(
          (c) =>
            Math.abs(c.lat - p.lat) < 1e-6 && Math.abs(c.lng - p.lng) < 1e-6
        )
      );
      setBouncingMarkers(bouncing.map((b) => b.name));
      setTimeout(() => setBouncingMarkers([]), 4000);

      setResults({ closestPair });
    },
    [setResults]
  );

  const isClosestMarker = useCallback(
    (p) =>
      results?.closestPair?.some(
        (c) => Math.abs(c.lat - p.lat) < 1e-6 && Math.abs(c.lng - p.lng) < 1e-6
      ),
    [results]
  );

  useEffect(() => {
    const timer = setTimeout(() => calculateResults(points), 300);
    return () => clearTimeout(timer);
  }, [points, calculateResults]);
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <>
      <Spinner loading={loading} />
      {!loading && (
        <div className="relative w-full h-full flex flex-col transition-colors duration-500 ease-in-out bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <MarkerBounce />
          <TextArea
            input={input}
            setInput={setInput}
            points={points}
            setPoints={setPoints}
            calculateResults={calculateResults}
            clearAll={clearAll}
          />

          {points.length > 1 && (
            <>
              <button
                className={`sm:text-xs absolute top-1/3 rounded-full topper px-1.5 py-1 font-bold transition-all duration-700  ${
                  closePoints ? "bg-red-500" : "bg-green-500"
                } cursor-pointer ${
                  closePoints ? "hover:bg-red-400" : "hover:bg-green-400"
                }`}
                onClick={handleClosePoints}
              >
                {closePoints ? "Close Points" : "Show Points"}
              </button>
              <PointsDisplay
                closePoints={closePoints}
                deletePoint={deletePoint}
                points={points}
                zoomToPoint={zoomToPoint}
              />
            </>
          )}
          <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              key={theme}
              center={[9.082, 8.6753]}
              zoom={6}
              className="h-full"
            >
              <TileLayer
                url={theme === "dark" ? darkUrl : lightUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapClickHandler
                handleMapClick={handleMapClick}
                setPoints={setPoints}
                handleClose={handleClose}
              />
              <LocateUser />
              <LocateControl points={points} setPoints={setPoints} />
              <Fitmap useMap={useMap} markers={points} />

              {/* Road-following blue route */}
              {points.length > 1 && <RoadRouting points={points} />}

              {/* Red dashed closest-to-first route */}
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

          {/* <Points
            points={points}
            setPoints={setPoints}
            updateInputFromPoints={updateInputFromPoints}
            calculateResults={calculateResults}
          /> */}
        </div>
      )}
    </>
  );
}
