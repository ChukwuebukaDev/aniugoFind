export default function PointsDisplay({ points }) {
  return (
    <div className="absolute text-white font-semibold rounded-2xl p-1.5 -translate-x-1/2 -translate-y-1/2 top-1/2 topper left-1/2 sm:w-md m-auto bg-black/70 max-h-[75vh] overflow-y-auto shadow-xl">
      <h3>📍 Points</h3>
      <ul className="list-none p-0">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex justify-between items-center p-2.5 mb-1.5"
          >
            <span>
              <strong>{p.name}</strong> — {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
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
  );
}
