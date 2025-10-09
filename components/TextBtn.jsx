const CalculateAndClearBtn = ({
  input,
  setPoints,
  clearAll,
  calculateResults,
}) => {
  // Parse manual input
  const handleCalculate = () => {
    try {
      const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const coords = lines.map((line, idx) => {
        const parts = line.split(",");
        if (parts.length < 2)
          throw new Error("Invalid format: use lat, lng, name(optional)");
        const [lat, lng, name] = parts.map((n) => n.trim());
        const parsed = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          name: name || `Point ${idx + 1}`,
        };
        if (isNaN(parsed.lat) || isNaN(parsed.lng))
          throw new Error(`Invalid coordinate: ${line}`);
        return parsed;
      });

      setPoints(coords);
      calculateResults(coords);
    } catch (err) {
      alert(err.message);
      clearAll();
    }
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
