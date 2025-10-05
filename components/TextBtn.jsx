const CalculateAndClearBtn = ({ handleCalculate, clearAll }) => {
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
