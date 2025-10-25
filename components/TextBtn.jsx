import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { filterSiteId } from "../utilities/siteIdFiltering";
import { motion } from "framer-motion";
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
  const [theme] = useDarkMode();
  const isDark = theme === "dark";

  const handleCalculate = () => {
    try {
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const manualCoords = lines.map((line, idx) => {
        const { coords, name } = filterSiteId(line);
        if (!coords)
          throw new Error(
            `Invalid coordinate or missing operator tag: ${line}`
          );

        return {
          lat: coords.lat,
          lng: coords.lng,
          name: name || `Manual Point ${idx + 1}`,
        };
      });

      const currentLocation = points.length > 0 ? points[0] : null;
      const mergedPoints = currentLocation
        ? [
            currentLocation,
            ...manualCoords.filter(
              (p) =>
                p.lat !== currentLocation.lat || p.lng !== currentLocation.lng
            ),
          ]
        : manualCoords;

      setProcessing(true);

      setTimeout(() => {
        setPoints(mergedPoints);
        calculateResults(mergedPoints);
        setProcessing(false);
        setShowInput(false);
      }, 800);
    } catch (err) {
      alert(err.message);
      clearAll();
      setProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center gap-3 mt-3">
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
        } disabled:opacity-60`}
      >
        {processing && <ClipLoader size={20} color="#fff" />}
        <span>{processing ? "Processing..." : "Calculate"}</span>
      </motion.button>

      {/* Clear Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={processing}
        onClick={clearAll}
        className={`px-5 py-2.5 rounded-full font-semibold backdrop-blur-md shadow-lg border transition-all duration-500 ${
          isDark
            ? "bg-red-600/70 border-red-400/30 text-white hover:bg-red-500/70"
            : "bg-red-500/80 border-red-700/20 text-white hover:bg-red-600/90"
        } disabled:opacity-60`}
      >
        Clear All
      </motion.button>
    </div>
  );
};

export default CalculateAndClearBtn;
