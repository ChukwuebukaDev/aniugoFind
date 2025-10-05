const DisplayResult = ({ results }) => {
  return (
    <>
      {results && (
        <div style={{ marginTop: "20px" }}>
          <h3>📊 Results</h3>
          <p>
            <strong>Total Route Distance:</strong>{" "}
            {results.totalDistance.toFixed(2)} km
          </p>
          <p>
            <strong>Closest Points:</strong> {results.minDist.toFixed(3)} km
            apart
          </p>
        </div>
      )}
    </>
  );
};
export default DisplayResult;
