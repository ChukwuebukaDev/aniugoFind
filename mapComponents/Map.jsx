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
import { X } from "lucide-react";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  const bounceTimeoutRef = useRef();

  const calculateResults = useCallback(async (pointList) => {
    if (!pointList || pointList.length < 2) {
      setResults(null);
      setBouncingMarkers([]);
      return;
    }

    try {
      const result = await findClosestToStartRoad(pointList);

      // Guard: invalid result
      if (!result || !result.pair || result.pair.some((p) => !p)) {
        setResults(null);
        setBouncingMarkers([]);
        return;
      }

      const [a, b] = result.pair;

      setResults({ closestPair: [a, b] });

      // Find markers to bounce
      const bouncing = pointList.filter(
        (p) =>
          (a &&
            Math.abs(p.lat - a.lat) < 1e-5 &&
            Math.abs(p.lng - a.lng) < 1e-5) ||
          (b &&
            Math.abs(p.lat - b.lat) < 1e-5 &&
            Math.abs(p.lng - b.lng) < 1e-5)
      );

      setBouncingMarkers(bouncing.map((m) => m.name));

      // Clear previous timeout
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
      bounceTimeoutRef.current = setTimeout(() => setBouncingMarkers([]), 4000);
    } catch (err) {
      console.error("Error calculating closest pair:", err);
      setResults(null);
      setBouncingMarkers([]);
    }
  }, []);

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

      <SavedCoordinatesSidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
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

      <MarkerBounce />

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
      {closePoints && points.length > 1 && (
        <button
          onClick={toggleClosePoints}
          className="absolute md:hidden cursor-pointer top-7 topper rounded-2xl font-bold p-1 bg-red-600 right-4 "
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
          {userLocation && <UserLocationMarker userLocation={userLocation} />}
          <MarkerLayer
            points={memoPoints}
            autoCluster={autoCluster}
            bouncingMarkers={bouncingMarkers}
            isClosestMarker={isClosestMarker}
            popupTarget={popupTarget}
          />
        </MapContainer>
      </div>
    </>
  );
}
