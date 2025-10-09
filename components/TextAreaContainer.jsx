import CalculateAndClearBtn from "./TextBtn";
const TextArea = ({
  input,
  setInput,
  setPoints,
  calculateResults,
  clearAll,
  setShowInput,
}) => {
  return (
    <div className="relative">
      <h2>🗺️ Coordinate Map with Distance Matrix</h2>
      <p>
        Click the map or input coordinates manually (format: lat, lng, name)
      </p>
      <textarea
        rows="6"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Example: 6.5244, 3.3792, Lagos"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />

      {/* Calculate and Clear buttons */}
      <CalculateAndClearBtn
        input={input}
        setPoints={setPoints}
        setShowInput={setShowInput}
        calculateResults={calculateResults}
        clearAll={clearAll}
      />
    </div>
  );
};
export default TextArea;
