import { useEffect, useState } from "react";
import { Navigation, X } from "lucide-react";
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
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [activePoint, setActivePoint] = useState({ open: false, index: null });
  const [distanceResults, setDistanceResults] = useState({});
  const [dispShow, setDispShow] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [totalDistance, setTotalDistance] = useState(null);

  // --- Delete Handlers ---
  const handleDeleteClick = (point) => setConfirmPoint(point);
  const handleConfirmDelete = () => {
    if (confirmPoint) deletePoint(points.indexOf(confirmPoint));
    setConfirmPoint(null);
  };

  const handleCancelDelete = () => setConfirmPoint(null);

  const handlePointDistanceCalculations = async (p, i) => {
    if (p.name === "Starting point") return;
    const userCurrentPoint = points.find((pt) => pt.name === "Starting point");
    if (!userCurrentPoint) return;

    const baseCoord = { lat: userCurrentPoint.lat, lng: userCurrentPoint.lng };
    const currentCoord = { lat: p.lat, lng: p.lng };
    const cacheKey = `${baseCoord.lat},${baseCoord.lng}_${p.lat},${p.lng}`;

    // Skip if cached
    if (distanceResults[cacheKey]) {
      setDispShow(i);
      return;
    }

    setLoadingIndex(i); // 🔄 Start spinner
    try {
      const { distance, duration } = await getRoadDistance(
        baseCoord,
        currentCoord
      );
      if (!distance && !duration) throw new Error();

      setDistanceResults((prev) => ({
        ...prev,
        [cacheKey]: { distance, duration, name: p.name },
      }));
      setDispShow(i);
    } catch (er) {
      console.error("Error fetching distance data:", er);
      setDistanceResults((prev) => ({
        ...prev,
        [cacheKey]: { error: "Failed to fetch distance data.", name: p.name },
      }));
      setDispShow(i);
    } finally {
      setLoadingIndex(null); // ✅ Stop spinner
    }
  };

  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hr`;
    } else {
      return `${minutes} min`;
    }
  }

  useEffect(() => {
    (async () => {
      const data = await getTotalDistance(points);
      if (data) setTotalDistance(data);
    })();
  }, [points]);

  // --- Point Zoom + Info ---
  const handlePointClick = (i) => {
    setActivePoint((prev) => {
      const isSame = prev.index === i;
      return { open: isSame ? !prev.open : true, index: i };
    });
  };

  const handlePointZoom = (p) => {
    if (zoomToPoint) {
      zoomToPoint(p.lat, p.lng, p.name);
    }
    setActivePoint({ open: false, index: null });
  };

  // --- Animation Variants ---
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence mode="wait">
      {closePoints && (
        <motion.div
          key="pointsBox"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed top-1/2 left-1/2 z-[999] -translate-x-1/2 topper -translate-y-1/2 w-[90vw] sm:max-w-md max-h-[75vh] overflow-y-auto 
                     bg-black/70 backdrop-blur-md text-white font-semibold rounded-2xl p-4 shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex text-black justify-between items-center mb-3 conic p-2 rounded-2xl font-semibold  cursor-pointer transition-colors duration-900 ">
            <div>
              <span className="text-xs">
                Total Distance: {totalDistance ?? "Loading..."}
              </span>
            </div>
            <span className="text-xs opacity-80">
              {points.filter((p) => p.name !== "Starting point").length < 2
                ? "Site Count: "
                : "Site Counts: "}
              {points.filter((p) => p.name !== "Starting point").length}
            </span>
          </div>

          {/* Points List */}
          {points.length === 0 ? (
            <p className="text-sm italic opacity-70">No points added yet.</p>
          ) : (
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {points.map((p, i) => {
                const isActive = activePoint.open && activePoint.index === i;
                const baseCoord = points.find(
                  (pt) => pt.name === "Starting point"
                );
                const cacheKey = baseCoord
                  ? `${baseCoord.lat},${baseCoord.lng}_${p.lat},${p.lng}`
                  : null;
                const result = cacheKey ? distanceResults[cacheKey] : null;

                return (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isActive}
                    onClick={() => handlePointClick(i)}
                    onKeyDown={(e) => e.key === "Enter" && handlePointClick(i)}
                    whileHover={{ scale: 1.03 }}
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.04, 1],
                            boxShadow: [
                              "0 0 0px rgba(255,215,0,0)",
                              "0 0 10px rgba(255,215,0,0.4)",
                              "0 0 0px rgba(255,215,0,0)",
                            ],
                            transition: {
                              duration: 1.5,
                              repeat: 3,
                              repeatType: "loop",
                            },
                          }
                        : { scale: 1, boxShadow: "none" }
                    }
                    className={`flex flex-col p-2 bg-gray-600/80 hover:bg-gray-500 hover:shadow-md 
                               cursor-pointer rounded-lg transition-all ${
                                 isActive ? "ring-2 ring-amber-400/60" : ""
                               }`}
                  >
                    {/* Info Row */}
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col text-sm">
                        <span>
                          Name: <strong>{p.name}</strong>
                        </span>
                        <span>
                          Coords: — {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                        </span>
                      </div>

                      {p.name !== "Starting point" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(p);
                          }}
                          className="bg-transparent font-bold text-amber-200 text-xl hover:scale-125 transition-transform"
                          title={`Delete ${p.name}`}
                        >
                          <X size={24} color="red" />
                        </button>
                      )}
                    </div>

                    {/* Active Panel */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="flex flex-col justify-center items-center mt-2 bg-black/80 text-xs p-2 rounded-lg"
                        >
                          <p className="mb-1">
                            Zoom to <strong>{p.name}</strong>?
                          </p>
                          <div className="flex gap-2.5 p-1">
                            <button
                              className="bg-green-700 p-2 rounded-xl hover:bg-green-600 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePointZoom(p);
                              }}
                            >
                              Yes
                            </button>

                            <button
                              className="bg-red-700 p-2 rounded-xl hover:bg-red-600 transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePoint({ open: false, index: null });
                              }}
                            >
                              No
                            </button>
                          </div>

                          <button
                            className="absolute self-end bg-white/10 p-2 rounded-full "
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToPoint(p);
                            }}
                          >
                            <Navigation size={24} color="red" />
                          </button>

                          {/* Tooltip + Distance Button */}
                          <div className="relative w-full mt-2">
                            {tooltipVisible === i && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-11 left-1/2 -translate-x-1/2 w-3/4 rounded-xl bg-gray-400 p-2 text-[10px] text-black text-center shadow-md"
                              >
                                <span className="font-bold text-yellow-800">
                                  Note:
                                </span>{" "}
                                This calculation starts from your current
                                position.
                              </motion.div>
                            )}

                            <button
                              disabled={loadingIndex === i}
                              className={`relative flex justify-center items-center bg-yellow-700 p-1 font-semibold w-full rounded-xl transition-all
      ${
        loadingIndex === i
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-yellow-600"
      }`}
                              onMouseEnter={() => setTooltipVisible(i)}
                              onMouseLeave={() => setTooltipVisible(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePointDistanceCalculations(p, i);
                              }}
                            >
                              {loadingIndex === i ? (
                                // 🔄 Spinner while calculating
                                <motion.div
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                  initial={{ rotate: 0 }}
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    ease: "linear",
                                    duration: 0.8,
                                  }}
                                />
                              ) : result && !result.error ? (
                                // ✅ Show distance summary on button after success
                                <span className="text-sm text-green-200 font-semibold">
                                  {result.distance > 1000
                                    ? `${(result.distance / 1000).toFixed(
                                        1
                                      )} km`
                                    : `${result.distance} m`}{" "}
                                  ({formatDuration(result.duration)})
                                </span>
                              ) : (
                                // 🧭 Default label before any calculation
                                <>Calculate Distance to {p.name}</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}

          {/* Delete confirmation modal */}
          <ConfirmModal
            show={!!confirmPoint}
            title={confirmPoint ? `Delete "${confirmPoint.name}"?` : ""}
            message="This action cannot be undone."
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
