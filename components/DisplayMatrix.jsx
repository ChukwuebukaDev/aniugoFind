const DisplayMatrix = ({ distanceMatrix, points, results }) => {
  return (
    <>
      {distanceMatrix.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>📐 Distance Matrix (km)</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <th></th>
                {points.map((p, idx) => (
                  <th key={idx}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distanceMatrix.map((row, i) => (
                <tr key={i}>
                  <th>{points[i].name}</th>
                  {row.map((dist, j) => (
                    <td
                      key={j}
                      style={{
                        border: "1px solid #ccc",
                        padding: "6px",
                        background:
                          i === j
                            ? "#f9f9f9"
                            : dist === results.minDist
                            ? "#ffd1d1"
                            : "white",
                      }}
                    >
                      {dist.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default DisplayMatrix;
