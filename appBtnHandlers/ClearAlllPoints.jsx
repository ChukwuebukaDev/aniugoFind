"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePointsStore } from "../Zustand/MapStateManager";

export default function ClearAllPointsButton() {
  const clearAllPoints = usePointsStore((s) => s.clearPoints);
  const [showConfirm, setShowConfirm] = useState(false);
  const { points } = usePointsStore();
  const handleClear = () => {
    clearAllPoints();
    setShowConfirm(false);
  };

  return (
    <>
      {points.length > 1 && (
        <div className="fixed bottom-15 left-0 z-[1000] flex flex-col items-start gap-2">
          {/* Main Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 rounded-r-full bg-red-600 px-4 py-2 text-white shadow-lg hover:bg-red-700"
          >
            <Trash2 size={18} />
            <span className="font-medium">Clear All Points</span>
          </motion.button>

          {/* Confirmation Box */}
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 w-[220px] rounded bg-white p-3 text-black shadow-lg"
            >
              <p className="mb-2 text-sm font-medium">
                Are you sure you want to clear all points? This cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowConfirm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded bg-gray-300 px-3 py-1 text-sm hover:bg-gray-400"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
}
