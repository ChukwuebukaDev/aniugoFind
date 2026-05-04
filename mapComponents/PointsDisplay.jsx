import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import { Navigation, Trash, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../utilities/Notifications/ConfirmModal";

import { getRoadDistance } from "../utilities/getRoadDistance";
import { navigateToPoint } from "../utilities/navigationToPoint";
import { getTotalDistance } from "../hooks/totalDistance";

import { usePointsStore } from "../Zustand/MapStateManager";
import { useUiStore } from "../Zustand/uiState";

function useDistanceManager() {
  const [distanceResults, setDistanceResults] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);

  const resultsRef = useRef({});
  const requestTokens = useRef({});

  useEffect(() => {
    resultsRef.current = distanceResults;
  }, [distanceResults]);

  const calculateDistance = useCallback(async (fromPoint, toPoint) => {
    if (!fromPoint || !toPoint || fromPoint.id === toPoint.id) return;

    const key = `${fromPoint.id}_${toPoint.id}`;

    if (resultsRef.current[key] && !resultsRef.current[key].error) return;

    const token = Symbol();
    requestTokens.current[key] = token;
    setLoadingKey(key);

    try {
      const result = await getRoadDistance(
        { lat: fromPoint.lat, lng: fromPoint.lng },
        { lat: toPoint.lat, lng: toPoint.lng },
      );

      if (requestTokens.current[key] !== token) return;
      if (!result) throw new Error("No result");

      setDistanceResults((prev) => ({
        ...prev,
        [key]: {
          fromId: fromPoint.id,
          toId: toPoint.id,
          distance: result.distance,
          duration: result.duration,
          formattedDuration: formatDuration(result.duration),
          timestamp: Date.now(),
        },
      }));
    } catch {
      if (requestTokens.current[key] !== token) return;
      setDistanceResults((prev) => ({
        ...prev,
        [key]: { fromId: fromPoint.id, toId: toPoint.id, error: true },
      }));
    } finally {
      if (requestTokens.current[key] === token) {
        setLoadingKey(null);
      }
    }
  }, []);

  const clearResultsForPoint = useCallback((pointId) => {
    setDistanceResults((prev) => {
      const next = {};
      for (const key in prev) {
        if (!key.startsWith(`${pointId}_`) && !key.endsWith(`_${pointId}`)) {
          next[key] = prev[key];
        }
      }
      return next;
    });
  }, []);

  return {
    distanceResults,
    loadingKey,
    calculateDistance,
    clearResultsForPoint,
  };
}

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
};

const formatDistance = (meters) => {
  if (!meters) return "";
  return meters > 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
};

function DistanceConfirmModal({ show, toPoint, points, onSelect, onClose }) {
  const otherPoints = useMemo(
    () => points.filter((p) => p.id !== toPoint?.id),
    [points, toPoint],
  );

  if (!show || !toPoint) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Calculate distance to</h3>
          <button onClick={onClose}>
            <X size={20} className="text-white/60 hover:text-white" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-pink-900/30 border border-pink-500/20">
          <p className="text-sm font-bold text-pink-200">{toPoint.name}</p>
          <p className="text-xs text-white/50">
            {toPoint.lat.toFixed(6)}, {toPoint.lng.toFixed(6)}
          </p>
        </div>

        <p className="text-xs text-white/60 mb-2">Select starting point:</p>
        <div className="space-y-2 max-h- overflow-y-auto">
          {otherPoints.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p, toPoint)}
              className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5
                         hover:border-amber-400/40 transition-all text-left group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {p.isUser && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-600">
                        YOU
                      </span>
                    )}
                    {p.name}
                  </p>
                  <p className="text- text-white/40">
                    {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-white/20 group-hover:text-amber-400"
                />
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

const PointItem = memo(function PointItem({
  p,
  isActive,
  points,
  distanceResults,
  loadingKey,
  toggleActive,
  handleArrivalToggle,
  setConfirmPoint,
  handlePointZoom,
  setDistanceModalPoint,
}) {
  const routesToThisPoint = useMemo(() => {
    return Object.entries(distanceResults)
      .filter(([, res]) => res.toId === p.id)
      .sort((a, b) => b[1].timestamp - a[1].timestamp);
  }, [distanceResults, p.id]);

  const isLoading = loadingKey?.endsWith(`_${p.id}`);

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`group p-4 rounded-2xl cursor-pointer
      bg-gradient-to-br from-gray-800/80 to-gray-700/60
      border border-white/5
      hover:border-amber-400/40
      hover:shadow-lg hover:shadow-amber-500/10
      transition-all
      ${isActive ? "ring-2 ring-amber-400/60" : ""}`}
    >
      <div
        onClick={() => toggleActive(p.id)}
        className="flex justify-between items-start"
      >
        <div>
          <p className="text-sm font-bold flex items-center gap-2">
            {p.isUser && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-600">
                YOU
              </span>
            )}
            {p.name}
          </p>
          <p className="text- opacity-60">
            {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
          </p>
        </div>

        {!p.isUser && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.arrival === "arrived"}
              onChange={() => handleArrivalToggle(p)}
              className="w-4 h-4"
            />
            <span
              className={`text-xs font-bold ${
                p.arrival === "arrived" ? "text-green-600" : "text-red-600"
              }`}
            >
              {p.arrival}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmPoint(p);
              }}
            >
              <Trash size={18} className="text-red-400 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-xl bg-black/70 border border-white/10 space-y-3"
          >
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePointZoom(p);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-2 text-sm font-semibold"
              >
                Zoom To
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToPoint(p);
                }}
                className="bg-white/10 hover:bg-white/20 rounded-xl p-2"
              >
                <Navigation size={18} />
              </button>
            </div>

            {routesToThisPoint.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                <p className="text-xs text-white/40 font-semibold">
                  Calculated Routes:
                </p>
                {routesToThisPoint.map(([key, res]) => {
                  const fromPoint = points.find((pt) => pt.id === res.fromId);
                  return (
                    <div
                      key={key}
                      className="text-xs flex justify-between items-center bg-white/5 rounded-lg px-2 py-1.5"
                    >
                      <span className="text-white/70 flex items-center gap-1">
                        {fromPoint?.isUser && (
                          <span className="text- px-1 rounded bg-emerald-600/50">
                            YOU
                          </span>
                        )}
                        {fromPoint?.name || "Unknown"}
                      </span>
                      <span className="text-amber-400 font-semibold">
                        {res.error
                          ? "Failed"
                          : `${formatDistance(res.distance)} • ${res.formattedDuration}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                setDistanceModalPoint(p);
              }}
              className="w-full py-2 rounded-xl text-sm font-semibold
              bg-pink-600 hover:bg-pink-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calculating…" : "Calculate Distance"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
});

export default function PointsDisplay({ zoomToPoint, deletePoint }) {
  const [activePointId, setActivePointId] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);
  const [confirmPoint, setConfirmPoint] = useState(null);
  const [distanceModalPoint, setDistanceModalPoint] = useState(null);

  const { toggleControl, activeControl } = useUiStore();
  const { points, markArrived, markPending } = usePointsStore();

  const basePoint = useMemo(() => points.find((p) => p.isUser), [points]);
  const nonUserPoints = useMemo(
    () => points.filter((p) => !p.isUser),
    [points],
  );
  const coordsSignature = useMemo(
    () => points.map((p) => `${p.lat},${p.lng}`).join("|"),
    [points],
  );

  const {
    distanceResults,
    loadingKey,
    calculateDistance,
    clearResultsForPoint,
  } = useDistanceManager();

  // Clear stale distance results when a point is deleted
  const prevPointsLength = useRef(points.length);
  useEffect(() => {
    if (points.length < prevPointsLength.current) {
      const currentIds = new Set(points.map((p) => p.id));
      Object.values(distanceResults).forEach((res) => {
        if (!currentIds.has(res.fromId) || !currentIds.has(res.toId)) {
          clearResultsForPoint(res.fromId);
        }
      });
    }
    prevPointsLength.current = points.length;
  }, [points.length, distanceResults, clearResultsForPoint]);

  useEffect(() => {
    let cancelled = false;
    const calculateTotal = async () => {
      if (!points || points.length < 2) {
        setTotalDistance(null);
        return;
      }
      const result = await getTotalDistance(points);
      if (!cancelled && result) setTotalDistance(result);
    };
    calculateTotal();
    return () => {
      cancelled = true;
    };
  }, [coordsSignature, points]);

  const toggleActive = useCallback((id) => {
    setActivePointId((prev) => (prev === id ? null : id));
  }, []);

  const handleArrivalToggle = useCallback(
    (point) => {
      point.arrival === "pending"
        ? markArrived(point.id)
        : markPending(point.id);
    },
    [markArrived, markPending],
  );

  const handlePointZoom = useCallback(
    (point) => {
      zoomToPoint?.(point.lat, point.lng, point.name);
      setActivePointId(null);
    },
    [zoomToPoint],
  );

  const handleDistanceSelect = useCallback(
    (fromPoint, toPoint) => {
      calculateDistance(fromPoint, toPoint);
      setDistanceModalPoint(null);
      setActivePointId(toPoint.id);
    },
    [calculateDistance],
  );

  const totalSites = nonUserPoints.length;
  const arrivedSites = useMemo(
    () => nonUserPoints.filter((p) => p.arrival === "arrived").length,
    [nonUserPoints],
  );
  const pendingSites = totalSites - arrivedSites;
  const progress = totalSites === 0 ? 0 : (arrivedSites / totalSites) * 100;

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  return (
    <AnimatePresence>
      {activeControl === "points" && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed topper top-1/2 left-1/2 z-[999]
                       -translate-x-1/2 -translate-y-1/2
                       w- conic sm:max-w-lg max-h- overflow-y-auto
                       backdrop-blur-xl rounded-3xl p-5 text-white
                       shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                       border border-white/10"
          >
            <button onClick={() => toggleControl("points")}>
              <X size={24} color="red" />
            </button>

            <div className="flex justify-between items-center mb-4 p-4 rounded-2xl bg-white/50 border border-white/10">
              <div>
                <p className="text-xs text-black font-bold opacity-70">
                  Total Distance
                </p>
                <p className="text-sm font-bold text-pink-900">
                  {totalDistance ?? "Calculating…"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 text-black font-bold">Sites</p>
                <p className="text-lg font-bold text-pink-900">{totalSites}</p>
              </div>
            </div>

            <div className="mb-5 h-3 w-full rounded-full bg-gray-600 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs opacity-70 mb-3">
              <span className="font-bold text-black">
                Pending: {pendingSites}
              </span>
              <span className="font-bold text-black">
                Arrived: {arrivedSites}
              </span>
            </div>

            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {points.map((p) => (
                <PointItem
                  key={p.id}
                  p={p}
                  isActive={activePointId === p.id}
                  points={points}
                  distanceResults={distanceResults}
                  loadingKey={loadingKey}
                  toggleActive={toggleActive}
                  handleArrivalToggle={handleArrivalToggle}
                  setConfirmPoint={setConfirmPoint}
                  handlePointZoom={handlePointZoom}
                  setDistanceModalPoint={setDistanceModalPoint}
                />
              ))}
            </motion.ul>

            <ConfirmModal
              show={!!confirmPoint}
              title={confirmPoint ? `Delete "${confirmPoint.name}"?` : ""}
              message="This action cannot be undone."
              onConfirm={() => {
                if (confirmPoint) {
                  clearResultsForPoint(confirmPoint.id);
                  deletePoint(confirmPoint.id);
                }
                setConfirmPoint(null);
              }}
              onCancel={() => setConfirmPoint(null)}
            />
          </motion.div>

          <DistanceConfirmModal
            show={!!distanceModalPoint}
            toPoint={distanceModalPoint}
            points={points}
            onSelect={handleDistanceSelect}
            onClose={() => setDistanceModalPoint(null)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
