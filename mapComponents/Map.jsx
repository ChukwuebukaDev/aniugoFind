// 🔹 React & Hooks
import { useState, useCallback, useEffect } from "react";
// 🔹 React-Leaflet
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
// 🔹 Components – Map Logic
import UserLocationMarker from "../mapComponents/UserLocationMarker";

import {
  MapClickHandler,
  ZoomableMarker,
  MarkerBounce,
} from "../mapComponents";

import { motion } from "framer-motion";
// 🔹 Components – UI
import PointsToggleBtn from "../appBtnHandlers/PointsToggleBtn";
import TextArea from "../components/TextAreaContainer";
import PointsDisplay from "../utilities/Notifications/PointsDisplay";
import Spinner from "../components/Spinner";
import SavedCoordinatesSidebar from "./SavedCoordinatesSidebar";
// 🔹 Hooks & Themes
import useDarkMode from "../Themes/useDarkMode";
import usePoints from "../hooks/usePoints";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CoordinateMap() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [closePoints, setClosePoints] = useState(true);
  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [popupTarget, setPopupTarget] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(null);
  const [offMap, setOffMap] = useState(false);
  const [theme] = useDarkMode();

  const {
    points,
    userLocation,
    addPoint,
    removePoint,
    clearPoints,
    setAllPoints,
  } = usePoints();

  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Show spinner briefly at load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // 🔹 Toggle close-points display
  const handleClosePoints = () => setClosePoints((prev) => !prev);

  // 🔹 Clear all except user
  const clearAll = useCallback(() => {
    clearPoints();
    setResults(null);
    setInput("");
    setBouncingMarkers([]);
  }, [clearPoints]);

  // 🔹 Delete point
  const deletePoint = (index) => removePoint(index);

  // 🔹 Calculate closest pair (for bounce + line)
  const calculateResults = useCallback(
    (pointList) => {
      if (pointList.length < 2) {
        setResults(null);
        return;
      }
      const first = pointList[0];
      let closestPoint = null;
      let minDist = Infinity;

      for (let i = 1; i < pointList.length; i++) {
        const p = pointList[i];
        const dx = first.lat - p.lat;
        const dy = first.lng - p.lng;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestPoint = p;
        }
      }

      const closestPair = [first, closestPoint];
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

  // 🔹 Recalculate closest pair when points change
  useEffect(() => {
    const timer = setTimeout(() => calculateResults(points), 300);
    return () => clearTimeout(timer);
  }, [points, calculateResults]);

  // 🔹 Zoom to a specific marker
  const ZoomHandler = ({ targetPoint }) => {
    const map = useMap();
    useEffect(() => {
      if (targetPoint) {
        map.flyTo([targetPoint.lat, targetPoint.lng], 15, {
          animate: true,
          duration: 2,
          easeLinearity: 0.25,
        });
      }
    }, [targetPoint, map]);
    return null;
  };

  const zoomToPoint = (lat, lng, name) => {
    setZoomTarget({ lat, lng });
    setBouncingMarkers([name]);
    setPopupTarget(name);
    setTimeout(() => setBouncingMarkers([]), 2000);
    setTimeout(() => setClosePoints(false), 400);
  };

  // 🔹 Fit map bounds to all points
  const FitmapHandler = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
      const fit = (list) => {
        if (!list || list.length === 0) return;
        const bounds = L.latLngBounds(list.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [60, 60] });
      };

      fit(markers);

      const handleRestoreFit = (e) => fit(e.detail);
      window.addEventListener("fitToMarkers", handleRestoreFit);
      return () => window.removeEventListener("fitToMarkers", handleRestoreFit);
    }, [map, markers]);

    return null;
  };

  return (
    <>
      <Spinner loading={loading} />
      {!loading && (
        <div className="relative w-full h-full flex flex-col bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
          {/* Sidebar Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08, x: isSidebarOpen ? 4 : -4 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.4, ease: "easeOut" },
            }}
            initial={{ opacity: 0, x: 10 }}
            onClick={() => setIsSidebarOpen((p) => !p)}
            className={`fixed top-1/3 z-[1100] px-2.5 py-1.5 text-xs font-semibold 
              backdrop-blur-sm shadow-lg border transition-all duration-500
              ${
                isSidebarOpen
                  ? "bg-red-600/80 border-red-400/40 right-0 rounded-l-full hover:bg-red-500/80 text-white shadow-red-300/30"
                  : "bg-emerald-600/80 border-emerald-400/40 left-0 rounded-r-full hover:bg-emerald-500/80 text-white shadow-emerald-300/30"
              }`}
          >
            {isSidebarOpen ? "Hide saved" : "Show saved"}
          </motion.button>

          <SavedCoordinatesSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            coordinates={points}
            onLoadSavedSet={(savedCoords) => {
              setAllPoints(savedCoords);
              setTimeout(() => {
                const event = new CustomEvent("fitToMarkers", {
                  detail: savedCoords,
                });
                window.dispatchEvent(event);
              }, 100);
            }}
          />

          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
            />
          )}

          <MarkerBounce />

          <TextArea
            input={input}
            setInput={setInput}
            points={points}
            setPoints={setAllPoints}
            calculateResults={calculateResults}
            clearAll={clearAll}
          />

          {points.length > 1 && (
            <>
              <PointsToggleBtn
                closePoints={closePoints}
                handleClosePoints={handleClosePoints}
              />
              <PointsDisplay
                closePoints={closePoints}
                deletePoint={deletePoint}
                points={points}
                zoomToPoint={zoomToPoint}
                setPopupTarget={setPopupTarget}
              />
            </>
          )}

          {/* Map Section */}
          <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              key={theme}
              center={[9.082, 8.6753]}
              zoom={6}
              className="h-full"
            >
              <TileLayer
                url={theme === "dark" ? darkUrl : lightUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {offMap && <MapClickHandler setPoints={setAllPoints} />}
              {zoomTarget && <ZoomHandler targetPoint={zoomTarget} />}
              <FitmapHandler markers={points} />
              {userLocation && (
                <UserLocationMarker userLocation={userLocation} />
              )}

              {/* {points.length > 1 && <RoadRouting points={points} />}
              {results?.closestPair && (
                <ClosestRoute closestPair={results.closestPair} />
              )} */}

              {/* Render all markers (including user) */}
              {points.map((p, idx) => {
                const isClosest = isClosestMarker(p);
                const isBouncing = bouncingMarkers.includes(p.name);
                const key = p.isUser
                  ? "user-location"
                  : p.name || `${p.lat}-${p.lng}-${idx}`;

                return (
                  <motion.div
                    key={key}
                    animate={isBouncing ? { y: [0, -12, 0] } : {}}
                    transition={{ repeat: 2, duration: 0.3 }}
                    style={{ transformOrigin: "bottom center" }}
                  >
                    <ZoomableMarker
                      point={p}
                      isClosest={isClosest}
                      openPopup={popupTarget === p.name}
                    />
                  </motion.div>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
