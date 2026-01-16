import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import useDarkMode from "../Themes/useDarkMode";

/**
 * Extract IHS Site ID and coordinates from free text
 */
const extractSiteAndCoords = (line) => {
  const siteMatch = line.match(/IHS_[A-Z0-9_]+/i);
  const coordMatch = line.match(/(-?\d+(\.\d+)?)\s*[,\s]\s*(-?\d+(\.\d+)?)/);

  if (!coordMatch) return null;

  return {
    name: siteMatch ? siteMatch[0] : undefined,
    lat: parseFloat(coordMatch[1]),
    lng: parseFloat(coordMatch[3]),
  };
};

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
  const [error, setError] = useState(null);

  const [theme] = useDarkMode();
  const isDark = theme === "dark";

  const handleCalculate = () => {
    const trimmed = input.trim();

    // Empty input
    if (!trimmed) {
      setWarning(true);
      setTimeout(() => setWarning(false), 2500);
      return;
    }

    setError(null);

    try {
      const lines = trimmed
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const extractedPoints = lines.map((line, idx) => {
        const extracted = extractSiteAndCoords(line);

        if (!extracted) {
          throw new Error(`Invalid format: "${line}"`);
        }

        return {
          lat: extracted.lat,
          lng: extracted.lng,
          name: extracted.name || `Manual Point ${idx + 1}`,
        };
      });

      // Preserve starting location if it exists
      const startingPoint = points.length > 0 ? points[0] : null;

      const mergedPoints = startingPoint
        ? [
            startingPoint,
            ...extractedPoints.filter(
              (p) =>
                !(p.lat === startingPoint.lat && p.lng === startingPoint.lng)
            ),
          ]
        : extractedPoints;

      // Remove duplicates
      const uniquePoints = mergedPoints.filter(
        (p, i, self) =>
          i === self.findIndex((x) => x.lat === p.lat && x.lng === p.lng)
      );

      setProcessing(true);

      setTimeout(() => {
        setPoints(uniquePoints);
        calculateResults(uniquePoints);
        setProcessing(false);
        setShowInput(false);
      }, 700);
    } catch (err) {
      setProcessing(false);
      setError(err.message || "Unable to parse input");
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-3 relative w-full">
      {/* Warning */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm bg-red-800/20 px-3 py-1 rounded-md"
          >
            ⚠️ Please enter at least one site or coordinate
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-red-500 text-sm bg-red-900/20 border border-red-500/30 px-3 py-1 rounded-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-3 relative">
        {processing && (
          <motion.div
            className="absolute inset-0 flex justify-center"
            animate={{ opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            <div
              className={`w-36 h-10 rounded-full blur-xl ${
                isDark ? "bg-emerald-500/40" : "bg-emerald-400/40"
              }`}
            />
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={processing}
          onClick={handleCalculate}
          className={`px-5 py-2.5 rounded-full font-semibold shadow-lg border ${
            isDark
              ? "bg-emerald-600/70 text-white"
              : "bg-emerald-500/80 text-white"
          } disabled:opacity-60 z-10`}
        >
          {processing && <ClipLoader size={18} color="#fff" />}
          {processing ? "Processing..." : "Calculate"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={processing}
          onClick={clearAll}
          className={`px-5 py-2.5 rounded-full font-semibold shadow-lg border ${
            isDark ? "bg-red-600/70 text-white" : "bg-red-500/80 text-white"
          } disabled:opacity-60 z-10`}
        >
          Clear All
        </motion.button>
      </div>
    </div>
  );
};

export default CalculateAndClearBtn;
