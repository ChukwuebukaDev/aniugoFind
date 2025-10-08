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
    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <button
        onClick={handleCalculate}
        style={{
          flex: 1,
          padding: "10px 16px",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Calculate
      </button>
      <button
        onClick={clearAll}
        style={{
          flex: 1,
          padding: "10px 16px",
          background: "#d32f2f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Clear All
      </button>
    </div>
  );
};

export default CalculateAndClearBtn;
