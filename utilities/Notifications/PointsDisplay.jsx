import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "./ConfirmModal";

export default function PointsDisplay({
  points,
  closePoints,
  deletePoint,
  zoomToPoint,
}) {
  const [confirmIndex, setConfirmIndex] = useState(null);

  const handleDeleteClick = (i) => setConfirmIndex(i);
  const handleConfirm = () => {
    deletePoint(confirmIndex);
    setConfirmIndex(null);
  };
  const handleCancel = () => setConfirmIndex(null);

  const handlePointClick = (p, i) => {
    if (confirmIndex !== null) return;
    if (zoomToPoint) zoomToPoint(p.lat, p.lng, p.name);
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
          className="fixed top-1/2 left-1/2 z-[999] -translate-x-1/2 -translate-y-1/2 sm:w-md max-h-[75vh] overflow-y-auto 
                     bg-black/70 backdrop-blur-md text-white font-semibold rounded-2xl p-3 shadow-2xl border border-white/10"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold mb-2 text-amber-400">📍 Points</h3>
            <span className="text-xs">
              Site Counts:{" "}
              {points.filter((p) => p.name !== "Starting Point").length}
            </span>
          </div>
          {points.length === 0 ? (
            <p className="text-sm italic opacity-70">No points added yet.</p>
          ) : (
            <ul className="list-none p-0 space-y-2">
              {points.map((p, i) => (
                <motion.li
                  key={i}
                  onClick={() => handlePointClick(p, i)}
                  whileHover={{ scale: 1.03 }}
                  className="flex justify-between items-center p-2 bg-gray-600/80 hover:bg-gray-500 cursor-pointer rounded-lg transition-all"
                  title={`Zoom to ${p.name}`}
                >
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
                      handleDeleteClick(i);
                    }}
                    className="bg-transparent font-bold text-amber-200 text-xl hover:scale-125 transition-transform"
                    title={`Delete ${p.name}`}
                  >
                    ❌
                  </button>
                </motion.li>
              ))}
            </ul>
          )}

          <ConfirmModal
            show={confirmIndex !== null}
            title={
              confirmIndex !== null
                ? `Delete "${points[confirmIndex].name}"?`
                : ""
            }
            message="This action cannot be undone."
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
