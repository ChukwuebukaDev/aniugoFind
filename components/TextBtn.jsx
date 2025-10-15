const CalculateAndClearBtn = ({
  input,
  points,
  setPoints,
  setShowInput,
  clearAll,
  calculateResults,
}) => {
  // 🧠 Parse manual input and merge with current location
  const handleCalculate = () => {
    try {
      // split user input into valid lines
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const manualCoords = lines.map((line, idx) => {
        const parts = line.split(",");
        if (parts.length < 2)
          throw new Error("Invalid format: use lat, lng, name(optional)");
        const [lat, lng, name] = parts.map((n) => n.trim());
        const parsed = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          name: name || `Manual Point ${idx + 1}`,
        };
        if (isNaN(parsed.lat) || isNaN(parsed.lng))
          throw new Error(`Invalid coordinate: ${line}`);
        return parsed;
      });

      // 🧭 Always ensure current location is first if it exists
      const currentLocation = points.length > 0 ? points[0] : null;
      let mergedPoints = [];
      console.log(currentLocation);

      if (currentLocation) {
        mergedPoints = [currentLocation, ...manualCoords];
      } else {
        mergedPoints = manualCoords;
      }

      setPoints(mergedPoints);
      calculateResults(mergedPoints);
    } catch (err) {
      alert(err.message);
      clearAll();
    }
    setShowInput((prev) => !prev);
  };

  return (
    <div className="flex justify-center items-center gap-2 absolute bottom-4 right-2">
      <button
        className="preset-btn bg-green-600 hover:bg-green-500"
        onClick={handleCalculate}
      >
        Calculate
      </button>
      <button
        className="preset-btn bg-red-600 hover:bg-red-500"
        onClick={clearAll}
      >
        Clear All
      </button>
    </div>
  );
};

export default CalculateAndClearBtn;
