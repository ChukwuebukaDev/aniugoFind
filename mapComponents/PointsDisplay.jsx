import { useEffect, useState, useMemo } from "react";
import { Navigation, Trash, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../utilities/Notifications/ConfirmModal";

import { getRoadDistance } from "../utilities/getRoadDistance";
import { navigateToPoint } from "../utilities/navigationToPoint";
import { getTotalDistance } from "../hooks/totalDistance";

import { usePointsStore } from "../Zustand/MapStateManager";
import { useUiStore } from "../Zustand/uiState";

export default function PointsDisplay({ zoomToPoint, deletePoint }) {
  const [activePointId, setActivePointId] = useState(null);
  const [distanceResults, setDistanceResults] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);
  const [confirmPoint, setConfirmPoint] = useState(null);

  const { toggleControl, activeControl } = useUiStore();
  const { points, markArrived, markPending } = usePointsStore();

  /* ---------------- Base user point (memoized) ---------------- */
  const basePoint = useMemo(
    () => points.find((p) => p.isUser),
    [points]
  );

  /* ---------------- Helpers ---------------- */

  const formatDuration = (seconds) => {
    if (!seconds) return "";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h && m) return `${h} hr ${m} min`;
    if (h) return `${h} hr`;
    return `${m} min`;
  };

  const toggleActive = (id) => {
    setActivePointId((prev) => (prev === id ? null : id));
  };

  const handleArrivalToggle = (point) => {
    if (point.arrival === "pending") {
      markArrived(point.id);
    } else {
      markPending(point.id);
    }
  };

  const handlePointZoom = (point) => {
    zoomToPoint?.(point.lat, point.lng, point.name);
    setActivePointId(null);
  };

  /* ---------------- Distance Calculation ---------------- */

  const handleDistanceCalc = async (point) => {
    if (!basePoint || point.isUser) return;

    const key = `${basePoint.id}_${point.id}`;

    if (distanceResults[key]) return;

    setLoadingId(point.id);

    try {
      const result = await getRoadDistance(
        { lat: basePoint.lat, lng: basePoint.lng },
        { lat: point.lat, lng: point.lng }
      );

      if (!result) throw new Error();

      setDistanceResults((prev) => ({
        ...prev,
        [key]: {
          distance: result.distance,
          duration: result.duration,
        },
      }));
    } catch {
      setDistanceResults((prev) => ({
        ...prev,
        [key]: { error: true },
      }));
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- Total Distance ---------------- */

  useEffect(() => {
    let cancelled = false;

    const calculateTotal = async () => {
      if (!points || points.length < 2) {
        setTotalDistance(null);
        return;
      }

      const result = await getTotalDistance(points);

      if (!cancelled && result) {
        setTotalDistance(result);
      }
    };

    calculateTotal();

    return () => {
      cancelled = true;
    };
  }, [points]);

  /* ---------------- Progress ---------------- */

  const totalSites = useMemo(
    () => points.filter((p) => !p.isUser).length,
    [points]
  );

  const arrivedSites = useMemo(
    () => points.filter((p) => p.arrival === "arrived" && !p.isUser).length,
    [points]
  );

  const pendingSites = totalSites - arrivedSites;

  const progress =
    totalSites === 0 ? 0 : (arrivedSites / totalSites) * 100;

  /* ---------------- Animations ---------------- */

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {activeControl === "points" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed topper top-1/2 left-1/2 z-[999]
                     -translate-x-1/2 -translate-y-1/2
                     w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto
                     bg-gradient-to-br from-black/80 via-black/60 to-black/80
                     backdrop-blur-xl rounded-3xl p-5 text-white
                     shadow-[0_25px_60px_rgba(0,0,0,0.6)]
                     border border-white/10"
        >
          {/* Close */}
          <button onClick={() => toggleControl("points")}>
            <X size={24} color="red" />
          </button>

          {/* Summary */}
          <div className="flex justify-between items-center mb-4 p-4 rounded-2xl bg-white/10 border border-white/10">
            <div>
              <p className="text-xs opacity-70">Total Distance</p>
              <p className="text-sm font-bold text-emerald-400">
                {totalDistance ?? "Calculating…"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-70">Sites</p>
              <p className="text-lg font-bold text-amber-400">
                {totalSites}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5 h-3 w-full rounded-full bg-gray-600 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs opacity-70 mb-3">
            <span>Pending: {pendingSites}</span>
            <span>Arrived: {arrivedSites}</span>
          </div>

          {/* Points List */}
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {points.map((p) => {
              const isActive = activePointId === p.id;

              const key = basePoint
                ? `${basePoint.id}_${p.id}`
                : null;

              const result = key ? distanceResults[key] : null;

              return (
                <motion.li
                  key={p.id}
                  variants={itemVariants}
                  onClick={() => toggleActive(p.id)}
                  className={`group p-4 rounded-2xl cursor-pointer
                  bg-gradient-to-br from-gray-800/80 to-gray-700/60
                  border border-white/5
                  hover:border-amber-400/40
                  hover:shadow-lg hover:shadow-amber-500/10
                  transition-all
                  ${isActive ? "ring-2 ring-amber-400/60" : ""}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-[11px] opacity-60">
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
                            p.arrival === "arrived"
                              ? "text-green-600"
                              : "text-red-600"
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
                          <Trash
                            size={18}
                            className="text-red-400 hover:text-red-600"
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded Section */}
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

                        <button
                          disabled={loadingId === p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDistanceCalc(p);
                          }}
                          className="w-full py-2 rounded-xl text-sm font-semibold
                          bg-amber-600 hover:bg-amber-500 disabled:opacity-60"
                        >
                          {loadingId === p.id
                            ? "Calculating…"
                            : result && !result.error
                            ? `${
                                result.distance > 1000
                                  ? (result.distance / 1000).toFixed(1) +
                                    " km"
                                  : result.distance + " m"
                              } • ${formatDuration(result.duration)}`
                            : "Calculate Distance"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Confirm Modal */}
          <ConfirmModal
            show={!!confirmPoint}
            title={
              confirmPoint
                ? `Delete "${confirmPoint.name}"?`
                : ""
            }
            message="This action cannot be undone."
            onConfirm={() => {
              if (confirmPoint) deletePoint(confirmPoint.id);
              setConfirmPoint(null);
            }}
            onCancel={() => setConfirmPoint(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}