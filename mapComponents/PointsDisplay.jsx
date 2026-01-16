import { useEffect, useState } from "react";
import { Navigation, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../utilities/Notifications/ConfirmModal";
import { getRoadDistance } from "../utilities/getRoadDistance";
import { navigateToPoint } from "../utilities/navigationToPoint";
import { getTotalDistance } from "../hooks/totalDistance";

export default function PointsDisplay({
  points,
  closePoints,
  deletePoint,
  zoomToPoint,
}) {
  const [confirmPoint, setConfirmPoint] = useState(null);
  const [activePoint, setActivePoint] = useState({ open: false, index: null });
  const [distanceResults, setDistanceResults] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(null);

  // -------------------- Helpers --------------------
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr`;
    return `${m} min`;
  };

  // -------------------- Effects --------------------
  useEffect(() => {
    (async () => {
      const data = await getTotalDistance(points);
      if (data) setTotalDistance(data);
    })();
  }, [points]);

  // -------------------- Actions --------------------
  const handlePointClick = (index) => {
    setActivePoint((prev) => ({
      open: prev.index === index ? !prev.open : true,
      index,
    }));
  };

  const handlePointZoom = (p) => {
    zoomToPoint?.(p.lat, p.lng, p.name);
    setActivePoint({ open: false, index: null });
  };

  const handleDeleteConfirm = () => {
    if (confirmPoint) deletePoint(points.indexOf(confirmPoint));
    setConfirmPoint(null);
  };

  const handleDistanceCalc = async (p, i) => {
    if (p.name === "Starting point") return;

    const base = points.find((pt) => pt.name === "Starting point");
    if (!base) return;

    const key = `${base.lat},${base.lng}_${p.lat},${p.lng}`;
    if (distanceResults[key]) return;

    setLoadingIndex(i);
    try {
      const { distance, duration } = await getRoadDistance(
        { lat: base.lat, lng: base.lng },
        { lat: p.lat, lng: p.lng }
      );

      setDistanceResults((prev) => ({
        ...prev,
        [key]: { distance, duration },
      }));
    } catch {
      setDistanceResults((prev) => ({
        ...prev,
        [key]: { error: true },
      }));
    } finally {
      setLoadingIndex(null);
    }
  };

  // -------------------- Animations --------------------
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // -------------------- Render --------------------
  return (
    <AnimatePresence>
      {closePoints && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="
            fixed topper top-1/2 left-1/2 z-[999]
            -translate-x-1/2 -translate-y-1/2
            w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto
            bg-gradient-to-br from-black/80 via-black/60 to-black/80
            backdrop-blur-xl
            rounded-3xl p-5
            text-white
            shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            border border-white/10
          "
        >
          {/* ---------- Header ---------- */}
          <div className="flex justify-between items-center mb-5 p-4 rounded-2xl bg-white/10 border border-white/10">
            <div>
              <p className="text-xs opacity-70">Total Distance</p>
              <p className="text-sm font-bold text-emerald-400">
                {totalDistance ?? "Calculating…"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-70">Sites</p>
              <p className="text-lg font-bold text-amber-400">
                {points.filter((p) => p.name !== "Starting point").length}
              </p>
            </div>
          </div>

          {/* ---------- List ---------- */}
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {points.map((p, i) => {
              const isActive = activePoint.open && activePoint.index === i;
              const base = points.find((pt) => pt.name === "Starting point");
              const key = base && `${base.lat},${base.lng}_${p.lat},${p.lng}`;
              const result = key && distanceResults[key];

              return (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  onClick={() => handlePointClick(i)}
                  className={`
                    group p-4 rounded-2xl cursor-pointer
                    bg-gradient-to-br from-gray-800/80 to-gray-700/60
                    border border-white/5
                    hover:border-amber-400/40
                    hover:shadow-lg hover:shadow-amber-500/10
                    transition-all
                    ${isActive ? "ring-2 ring-amber-400/60" : ""}
                  `}
                >
                  {/* Info */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-[11px] opacity-60">
                        {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                      </p>
                    </div>

                    {p.name !== "Starting point" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmPoint(p);
                        }}
                        className="opacity-60 hover:opacity-100 hover:scale-110 transition"
                      >
                        <Trash size={18} className="text-red-400" />
                      </button>
                    )}
                  </div>

                  {/* Expanded Actions */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 rounded-xl bg-black/70 border border-white/10 space-y-3"
                      >
                        {/* Zoom */}
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

                        {/* Distance */}
                        <button
                          disabled={loadingIndex === i}
                          onMouseEnter={() => setTooltipVisible(i)}
                          onMouseLeave={() => setTooltipVisible(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDistanceCalc(p, i);
                          }}
                          className="
                            w-full py-2 rounded-xl text-sm font-semibold
                            bg-amber-600 hover:bg-amber-500
                            disabled:opacity-60
                          "
                        >
                          {loadingIndex === i ? (
                            <span className="animate-pulse">Calculating…</span>
                          ) : result && !result.error ? (
                            <>
                              {result.distance > 1000
                                ? `${(result.distance / 1000).toFixed(1)} km`
                                : `${result.distance} m`}{" "}
                              • {formatDuration(result.duration)}
                            </>
                          ) : (
                            "Calculate Distance"
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* ---------- Confirm Modal ---------- */}
          <ConfirmModal
            show={!!confirmPoint}
            title={confirmPoint ? `Delete "${confirmPoint.name}"?` : ""}
            message="This action cannot be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setConfirmPoint(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
