function ConvertSecondsToHMS(totalSeconds) {
  const remaining = totalSeconds % 3600;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  // Add leading zeros
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return (
    <strong className="text-green-300">
      {`${formattedHours}hr ${formattedMinutes}m`}
    </strong>
  );
}

export default function DistanceDisplay({ distanceSummary }) {
  if (!distanceSummary || Object.keys(distanceSummary).length === 0) {
    return (
      <div className="bg-black/70 text-gray-300 text-sm italic p-2 rounded-lg mt-2 text-center">
        No distance data available.
      </div>
    );
  }

  return (
    <div className="bg-black/70 text-white p-2 rounded-lg mt-2">
      {Object.entries(distanceSummary).map(([name, info], i) => (
        <div key={i} className="text-center mb-2">
          {info.error ? (
            <p className="text-red-400 text-xs">{info.error}</p>
          ) : (
            <>
              <p className="text-sm">
                <span className="text-gray-300">Distance:</span>{" "}
                <strong className="text-green-300">
                  {info.distance > 1000
                    ? `${(info.distance / 1000).toFixed(1)} km`
                    : `${info.distance} m`}
                </strong>
              </p>
              {info.duration && (
                <p className="text-sm">
                  <span className="text-gray-300">Duration:</span>{" "}
                  {ConvertSecondsToHMS(info.duration)}
                </p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
