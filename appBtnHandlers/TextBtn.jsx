import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { filterSiteId } from "../utilities/siteIdFiltering";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "../Themes/useDarkMode";

const CalculateAndClearBtn = ({
  input,
  points,
  setPoints,
  setShowInput,
  clearAll,
  calculateResults,
}) => {
  const [processing, setProcessing] = useState(false);
  const [warning, setWarning] = useState(false);
  const [theme] = useDarkMode();
  const isDark = theme === "dark";

  const handleCalculate = () => {
    const trimmed = input.trim();

    // 🔸 If user hasn't entered anything, show temporary warning
    if (!trimmed) {
      setWarning(true);
      setTimeout(() => setWarning(false), 2500);
      return;
    }

    try {
      const lines = trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // 🔹 Parse each line: allow both “with” and “without” site IDs
      const manualCoords = lines
        .filter((line) => !/Starting\s*Point/i.test(line))
        .map((line, idx) => {
          const parsed = filterSiteId(line);

          // If filterSiteId fails, try to extract plain coordinates
          let coords = parsed?.coords;
          let name = parsed?.name;

          if (!coords) {
            const match = line.match(/(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/);
            if (match) {
              coords = { lat: parseFloat(match[1]), lng: parseFloat(match[3]) };
              name = `Manual Point ${idx + 1}`;
            }
          }

          if (!coords) throw new Error(`Invalid coordinate format: "${line}"`);

          return {
            lat: coords.lat,
            lng: coords.lng,
            name: name || `Manual Point ${idx + 1}`,
          };
        });

      // 🔹 Deduplicate & merge with current location
      const currentLocation = points.length > 0 ? points[0] : null;
      const mergedPoints = currentLocation
        ? [
            currentLocation,
            ...manualCoords.filter(
              (p) =>
                !(
                  p.lat === currentLocation.lat && p.lng === currentLocation.lng
                )
            ),
          ]
        : manualCoords;

      // 🔹 Remove duplicates between manual points
      const uniquePoints = mergedPoints.filter(
        (point, index, self) =>
          index ===
          self.findIndex((p) => p.lat === point.lat && p.lng === point.lng)
      );

      // 🔹 Simulate processing + trigger map update
      setProcessing(true);
      setTimeout(() => {
        setPoints(uniquePoints);
        calculateResults(uniquePoints);
        setProcessing(false);
        setShowInput(false);
        setError(null);
      }, 800);
    } catch (err) {
      // 🔸 Instead of alert, show an inline error message
      setError(err.message);
      clearAll();
      setProcessing(false);

      // Auto-clear error after a few seconds
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-3 relative w-full">
      {/* ⚠️ Animated Warning */}
      <AnimatePresence>
        {warning && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.05, 1],
              x: [0, -10, 10, -6, 6, 0],
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
            className="text-red-400 text-sm font-medium bg-red-800/20 dark:bg-red-500/10 border border-red-400/30 px-3 py-1 rounded-md mb-1"
          >
            ⚠️ Please enter at least one coordinate first!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons Row */}
      <div className="flex justify-center items-center gap-3 relative">
        {/* Pulsing glow while processing */}
        {processing && (
          <motion.div
            className="absolute inset-0 flex justify-center"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: [0.6, 0.2, 0.6], scale: [1, 1.15, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            <div
              className={`w-36 h-10 rounded-full blur-xl ${
                isDark ? "bg-emerald-500/40" : "bg-emerald-400/40"
              }`}
            ></div>
          </motion.div>
        )}

        {/* Calculate Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={processing}
          onClick={handleCalculate}
          className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold backdrop-blur-md shadow-lg border transition-all duration-500 ${
            isDark
              ? "bg-emerald-600/70 border-emerald-400/30 text-white hover:bg-emerald-500/70"
              : "bg-emerald-500/80 border-emerald-700/20 text-white hover:bg-emerald-600/90"
          } disabled:opacity-60 z-10`}
        >
          {processing && <ClipLoader size={20} color="#fff" />}
          <span>{processing ? "Processing..." : "Calculate"}</span>
        </motion.button>

        {/* Clear Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: isDark
              ? "0 0 20px rgba(239, 68, 68, 0.6)"
              : "0 0 20px rgba(239, 68, 68, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          disabled={processing}
          onClick={clearAll}
          className={`px-5 py-2.5 rounded-full font-semibold backdrop-blur-md shadow-lg border transition-all duration-500 ${
            isDark
              ? "bg-red-600/70 border-red-400/30 text-white hover:bg-red-500/70"
              : "bg-red-500/80 border-red-700/20 text-white hover:bg-red-600/90"
          } disabled:opacity-60 z-10`}
        >
          Clear All
        </motion.button>
      </div>
    </div>
  );
};

export default CalculateAndClearBtn;
