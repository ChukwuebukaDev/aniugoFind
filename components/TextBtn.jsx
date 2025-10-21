import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { filterSiteId } from "../utilities/siteIdFiltering";
const CalculateAndClearBtn = ({
  input,
  points,
  setPoints,
  setShowInput,
  clearAll,
  calculateResults,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleCalculate = () => {
    try {
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const manualCoords = lines.map((line, idx) => {
        // Use the filterSiteId helper
        const { coords, name } = filterSiteId(line);

        if (!coords)
          throw new Error(
            `Invalid coordinate or missing operator tag: ${line}`
          );

        const parsed = {
          lat: coords.lat,
          lng: coords.lng,
          name: name || `Manual Point ${idx + 1}`,
        };

        return parsed;
      });

      const currentLocation = points.length > 0 ? points[0] : null;

      let mergedPoints = [];
      if (currentLocation) {
        mergedPoints = [
          currentLocation,
          ...manualCoords.filter(
            (p) =>
              p.lat !== currentLocation.lat || p.lng !== currentLocation.lng
          ),
        ];
      } else {
        mergedPoints = manualCoords;
      }

      setProcessing(true);

      setTimeout(() => {
        setPoints(mergedPoints);
        calculateResults(mergedPoints);
        setProcessing(false);
        setShowInput((prev) => !prev);
      }, 800);
    } catch (err) {
      alert(err.message);
      clearAll();
      setProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 absolute bottom-4 right-2">
      <button
        className="preset-btn bg-green-600 hover:bg-green-500 relative flex items-center justify-center px-4 py-2"
        onClick={handleCalculate}
        disabled={processing}
      >
        {processing && (
          <ClipLoader size={20} color="#ffffff" className="mr-2" />
        )}
        <span>{processing ? "Processing..." : "Calculate"}</span>
      </button>

      <button
        className="preset-btn bg-red-600 hover:bg-red-500 px-4 py-2"
        onClick={clearAll}
        disabled={processing}
      >
        Clear All
      </button>
    </div>
  );
};

export default CalculateAndClearBtn;
