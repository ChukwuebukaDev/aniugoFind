import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import "react-leaflet-cluster/dist/assets/MarkerCluster.default.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import { motion, AnimatePresence } from "framer-motion";

import UserLocationMarker from "./Markers/UserLocationMarker";
import {
  MapClickHandler,
  MarkerBounce,
  MarkerLayer,
  RoadRouting,
  FitmapHandler,
} from "../mapComponents";
import { findClosestToStartRoad } from "../utilities/closestPairsCalculation";
import TextArea from "../components/TextAreaContainer";
import PointsDisplay from "./PointsDisplay";
import Spinner from "../components/Spinner";
import ExcelCoordinateImporter from "../components/Importer";
import SavedCoordinatesSidebar from "./SavedCoordinatesSidebar";
import useDarkMode from "../Themes/useDarkMode";
import { usePointsStore } from "../Zustand/MapStateManager";
import { useUiStore } from "../Zustand/uiState";
import { MapControls } from "../appBtnHandlers/MapControls";
import { X } from "lucide-react";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function findClosestPair(points = []) {
  if (points.length < 2) return null;
  let minDist = Infinity;
  let pair = null;
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dx = a.lat - b.lat;
      const dy = a.lng - b.lng;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        pair = [a, b];
      }
    }
  }
  return pair;
}

// -----------------
export default function CoordinateMap() {
  const mapRef = useRef();
  const [theme] = useDarkMode();
  const {
    isSidebarOpen,
    results,
    loading,
    autoCluster,
    showImporter,
    toggleSidebar,
    setLoading,
    setResults,
    closePoints,
    setClosePoints,
    toggleClosePoints,
    toggleShowImporter,
  } = useUiStore();

  const { points, userLocation, removePoint, clearPoints, setAllPoints } =
    usePointsStore();

  // Local UI states
  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [popupTarget, setPopupTarget] = useState(null);
  const [input, setInput] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [offMap, setOffMap] = useState(false);

  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Spinner on mount
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [setLoading]);

  // ----------------- Closest pair calculation
  const calculateResults = useCallback(
    async (pointList) => {
      if (!pointList || pointList.length < 2) {
        setResults(null);
        return;
      }

      const result = await findClosestToStartRoad(pointList);
      if (!result) {
        setResults(null);
        return;
      }

      const [a, b] = result.pair;

      setResults({ closestPair: [a, b] });

      // Bounce effect
      const bouncing = pointList.filter(
        (p) =>
          (Math.abs(p.lat - a.lat) < 1e-6 && Math.abs(p.lng - a.lng) < 1e-6) ||
          (Math.abs(p.lat - b.lat) < 1e-6 && Math.abs(p.lng - b.lng) < 1e-6)
      );
      setBouncingMarkers(bouncing.map((b) => b.name));
      const timeout = setTimeout(() => setBouncingMarkers([]), 4000);
      return () => clearTimeout(timeout);
    },
    [setResults]
  );

  // Debounce calculation
  useEffect(() => {
    const id = setTimeout(() => {
      calculateResults(points);
    }, 300);
    return () => clearTimeout(id);
  }, [points, calculateResults]);

  const isClosestMarker = useCallback(
    (p) =>
      results?.closestPair?.some(
        (c) => Math.abs(c.lat - p.lat) < 1e-6 && Math.abs(c.lng - p.lng) < 1e-6
      ),
    [results]
  );

  const clearAll = useCallback(() => {
    clearPoints();
    setResults(null);
    setInput("");
    setBouncingMarkers([]);
  }, [clearPoints, setResults]);

  const deletePoint = (index) => removePoint(index);

  const zoomToPoint = (lat, lng, name) => {
    const map = mapRef.current;
    if (!map) return;
    setPopupTarget(name);
    setBouncingMarkers([name]);
    setTimeout(() => setBouncingMarkers([]), 2000);
    setTimeout(() => setClosePoints(false), 400);
    map.flyTo([lat, lng], 12, { animate: true, duration: 1.2 });
    window.dispatchEvent(
      new CustomEvent("zoomToMarker", { detail: { lat, lng } })
    );
  };

  const memoPoints = useMemo(() => points, [points]);

  return (
    <>
      <Spinner loading={loading} />
      {!loading && (
        <div className="relative w-full h-full flex flex-col bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
          <SavedCoordinatesSidebar
            isOpen={isSidebarOpen}
            onClose={() => toggleSidebar}
            coordinates={points}
            onLoadSavedSet={(savedCoords) => {
              setAllPoints(savedCoords);
              setTimeout(
                () =>
                  window.dispatchEvent(
                    new CustomEvent("fitToMarkers", { detail: savedCoords })
                  ),
                100
              );
            }}
          />

          {isSidebarOpen && (
            <div
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
            />
          )}

          <MarkerBounce />

          <MapControls />

          <div className="relative z-[1000] flex flex-col items-end">
            <AnimatePresence>
              {showImporter && (
                <motion.div
                  key="excel-importer"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[70%]"
                >
                  <ExcelCoordinateImporter
                    onImport={(importedPoints) => {
                      setAllPoints(importedPoints);
                      useUiStore.getState().setShowImporter(false);
                      setTimeout(
                        () =>
                          window.dispatchEvent(
                            new CustomEvent("fitToMarkers", {
                              detail: importedPoints,
                            })
                          ),
                        100
                      );
                    }}
                    setShowImporter={toggleShowImporter}
                    onLoading={importLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              <PointsDisplay
                closePoints={closePoints}
                deletePoint={deletePoint}
                points={points}
                zoomToPoint={zoomToPoint}
                setPopupTarget={setPopupTarget}
              />
            </>
          )}
          {closePoints && (
            <button
              onClick={toggleClosePoints}
              className="absolute cursor-pointer top-7 topper rounded-2xl font-bold p-1 bg-red-600 right-4 "
            >
              <X size={18} />
            </button>
          )}
          <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              key={theme}
              center={[9.082, 8.6753]}
              zoom={6}
              className="h-full"
              whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
            >
              <TileLayer
                url={theme === "dark" ? darkUrl : lightUrl}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <RoadRouting points={points} />
              {offMap && <MapClickHandler setPoints={setAllPoints} />}
              <FitmapHandler markers={memoPoints} />
              {userLocation && (
                <UserLocationMarker userLocation={userLocation} />
              )}
              <MarkerLayer
                points={memoPoints}
                autoCluster={autoCluster}
                bouncingMarkers={bouncingMarkers}
                isClosestMarker={isClosestMarker}
                popupTarget={popupTarget}
              />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
