import { useState, useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import RadiusClusterOverlay from "./Cluster/ClusterOverlay";
import UserLocationMarker from "./Markers/UserLocationMarker";
import {
  MarkerBounce,
  MarkerLayer,
  RoadRouting,
  FitmapHandler,
  LocateControl,
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

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CoordinateMap() {
  const mapRef = useRef(null);
  const bounceTimeoutRef = useRef(null);
  const debounceRef = useRef(null);

  const [theme] = useDarkMode();

  const {
    isSidebarOpen,
    results,
    loading,
    autoCluster,
    showImporter,
    toggleControl,
    setLoading,
    setResults,
    setClosePoints,
  } = useUiStore();

  const { points, userLocation, removePoint, clearPoints, setAllPoints } =
    usePointsStore();

  const [bouncingMarkers, setBouncingMarkers] = useState([]);
  const [popupTarget, setPopupTarget] = useState(null);
  const [input, setInput] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const lightUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  /* ---------------- Spinner on mount ---------------- */

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [setLoading]);

  /* ---------------- Closest Pair Calculation ---------------- */

  const calculateResults = useCallback(
    async (pointList) => {
      if (!pointList || pointList.length < 2) {
        setResults(null);
        setBouncingMarkers([]);
        return;
      }

      try {
        const result = await findClosestToStartRoad(pointList);

        if (!result?.pair || result.pair.some((p) => !p)) {
          setResults(null);
          setBouncingMarkers([]);
          return;
        }

        const [a, b] = result.pair;

        setResults({ closestPair: [a, b] });

        const bouncing = pointList.filter(
          (p) =>
            (a &&
              Math.abs(p.lat - a.lat) < 1e-5 &&
              Math.abs(p.lng - a.lng) < 1e-5) ||
            (b &&
              Math.abs(p.lat - b.lat) < 1e-5 &&
              Math.abs(p.lng - b.lng) < 1e-5),
        );

        setBouncingMarkers(bouncing.map((m) => m.name));

        if (bounceTimeoutRef.current) {
          clearTimeout(bounceTimeoutRef.current);
        }

        bounceTimeoutRef.current = setTimeout(
          () => setBouncingMarkers([]),
          4000,
        );
      } catch (err) {
        console.error("Error calculating closest pair:", err);
        setResults(null);
        setBouncingMarkers([]);
      }
    },
    [setResults],
  );

  /* ---------------- Debounced Calculation ---------------- */

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      calculateResults(points);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [points, calculateResults]);

  /* ---------------- Closest Marker Helper ---------------- */

  const isClosestMarker = useCallback(
    (p) =>
      results?.closestPair?.some(
        (c) => Math.abs(c.lat - p.lat) < 1e-6 && Math.abs(c.lng - p.lng) < 1e-6,
      ),
    [results],
  );

  /* ---------------- Clear All ---------------- */

  const clearAll = useCallback(() => {
    clearPoints();
    setResults(null);
    setInput("");
    setBouncingMarkers([]);
  }, [clearPoints, setResults]);

  /* ---------------- Delete Point ---------------- */

  const deletePoint = (id) => {
    removePoint(id);
  };

  /* ---------------- Zoom To Marker ---------------- */

  const zoomToPoint = (lat, lng, name) => {
    const map = mapRef.current;
    if (!map) return;

    setPopupTarget(name);
    setBouncingMarkers([name]);

    setTimeout(() => setBouncingMarkers([]), 2000);
    setTimeout(() => setClosePoints(false), 400);

    map.flyTo([lat, lng], 12, {
      animate: true,
      duration: 1.2,
    });

    window.dispatchEvent(
      new CustomEvent("zoomToMarker", {
        detail: { lat, lng },
      }),
    );
  };

  /* ---------------- Cleanup ---------------- */

  useEffect(() => {
    return () => {
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    };
  }, []);

  return (
    <>
      <Spinner loading={loading} />

      <SavedCoordinatesSidebar
        isOpen={isSidebarOpen}
        onClose={toggleControl}
        coordinates={points}
        onLoadSavedSet={(savedCoords) => {
          setAllPoints(savedCoords);

          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("fitToMarkers", {
                detail: savedCoords,
              }),
            );
          }, 100);
        }}
      />

      <MarkerBounce />

      {/* Excel Importer */}
      <div className="relative z-[1000] flex flex-col items-end">
        <AnimatePresence>
          {showImporter && (
            <motion.div
              key="excel-importer"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute top-[15%] left-1/2 -translate-x-1/2
              w-[90%] sm:w-[70%]"
            >
              <ExcelCoordinateImporter
                onImport={(importedPoints) => {
                  setAllPoints(importedPoints);

                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent("fitToMarkers", {
                        detail: importedPoints,
                      }),
                    );
                  }, 100);
                }}
                setShowImporter={toggleControl}
                onLoading={setImportLoading}
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
        <PointsDisplay deletePoint={deletePoint} zoomToPoint={zoomToPoint} />
      )}

      {/* Map */}
      <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden shadow-md">
        <MapContainer
          key={theme}
          center={[9.082, 8.6753]}
          zoom={6}
          className="h-full"
          zoomControl={false}
          whenCreated={(map) => (mapRef.current = map)}
        >
          <TileLayer
            url={theme === "dark" ? darkUrl : lightUrl}
            attribution="&copy; OpenStreetMap"
          />

          <RoadRouting points={points} />

          <FitmapHandler markers={points} />
          <RadiusClusterOverlay
            points={points}
            radius={10500}
            onCountChange={(count) => console.log("Cluster count:", count)}
          />
          {userLocation && <UserLocationMarker userLocation={userLocation} />}

          <MarkerLayer
            points={points}
            autoCluster={autoCluster}
            bouncingMarkers={bouncingMarkers}
            isClosestMarker={isClosestMarker}
            popupTarget={popupTarget}
          />

          <LocateControl />
        </MapContainer>
      </div>
    </>
  );
}
