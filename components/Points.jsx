const Points = ({
  points,
  setPoints,
  updateInputFromPoints,
  calculateResults,
}) => {
  // Delete a single point
  const deletePoint = (index) => {
    const updated = points.filter((_, i) => i !== index);
    setPoints(updated);
    updateInputFromPoints(updated);
    calculateResults(updated);
  };
  return (
    <>
      {points.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📍 Points</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {points.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f4f4f4",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  marginBottom: "5px",
                }}
              >
                <span>
                  <strong>{p.name}</strong> — {p.lat.toFixed(6)},{" "}
                  {p.lng.toFixed(6)}
                </span>
                <button
                  onClick={() => deletePoint(i)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#d32f2f",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
export default Points;
