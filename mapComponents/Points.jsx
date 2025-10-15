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
        <div className="mt-5">
          <h3>📍 Points</h3>
          <ul className="list-none p-0">
            {points.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center p-2.5 mb-1.5"
              >
                <span>
                  <strong>{p.name}</strong> — {p.lat.toFixed(6)},{" "}
                  {p.lng.toFixed(6)}
                </span>
                <button
                  className="bg-transparent font-bold cursor-pointer text-amber-950 text-xl"
                  onClick={() => deletePoint(i)}
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
