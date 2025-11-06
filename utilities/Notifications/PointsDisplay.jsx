import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./ConfirmModal";
import { getCurrentLocation } from "../../otherScripts.js/getLocation";

export default function PointsDisplay({
  points,
  closePoints,
  deletePoint,
  zoomToPoint,
}) {
  const [confirmPoint, setConfirmPoint] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activePoint, setActivePoint] = useState({ open: false, index: null });

  console.log(getCurrentLocation());

  // --- Delete Handlers ---
  const handleDeleteClick = (point) => setConfirmPoint(point);
  const handleConfirmDelete = () => {
    if (confirmPoint) deletePoint(points.indexOf(confirmPoint));
    setConfirmPoint(null);
  };
  const handleCancelDelete = () => setConfirmPoint(null);

  // const calculatePointDistance = (p,i) => {
  //   const baseCoord =
  // }

  // --- Point Zoom + Info ---
  const handlePointClick = (i) => {
    setActivePoint((prev) => {
      const isSame = prev.index === i;
      return { open: isSame ? !prev.open : true, index: i };
    });
  };

  const handlePointZoom = (p) => {
    if (zoomToPoint) zoomToPoint(p.lat, p.lng, p.name);
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
          className="fixed top-1/2 left-1/2 z-[999] -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:max-w-md max-h-[75vh] overflow-y-auto 
                     bg-black/70 backdrop-blur-md text-white font-semibold rounded-2xl p-4 shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-amber-400">📍 Points</h3>
            <span className="text-xs opacity-80">
              Site Count:{" "}
              {points.filter((p) => p.name !== "Starting Point").length}
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

                return (
                  <motion.li
                    key={i}
                    variants={itemVariants}
                    tabIndex={0}
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
                              repeat: Infinity,
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(p);
                        }}
                        className="bg-transparent font-bold text-amber-200 text-xl hover:scale-125 transition-transform"
                        title={`Delete ${p.name}`}
                      >
                        ❌
                      </button>
                    </div>

                    {/* Zoom + Tooltip Section */}
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

                          {/* Tooltip Button */}
                          <div className="relative w-full mt-2">
                            {tooltipVisible && (
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
                              className="bg-yellow-700 p-1 font-semibold w-full rounded-xl"
                              onMouseEnter={() => setTooltipVisible(true)}
                              onMouseLeave={() => setTooltipVisible(false)}
                            >
                              Calculate Distance to {p.name}
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
