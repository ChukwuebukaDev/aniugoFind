import { useState } from "react";
import { useMap } from "react-leaflet";

function LocateControl({ points, setPoints }) {
  const map = useMap();
  const [pulsing, setPulsing] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleLocate = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to the map
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    setPulsing(true);
    setTimeout(() => setPulsing(false), 1200);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 13, { animate: true, duration: 2 });

        // Add as a React point
        const pointName = "You are here";
        const exists = points.some((p) => p.name === pointName);
        if (!exists) {
          setPoints((prev) => [
            ...prev,
            { lat: latitude, lng: longitude, name: pointName },
          ]);
        }
      },
      (err) => {
        alert("Unable to retrieve location. Please allow location access.");
        console.warn(err);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246, 0); }
        }
        .pulse { animation: pulse 1.2s ease-out; }
      `}</style>

      <button
        onClick={handleLocate}
        className={`cursor-pointer fixed md:absolute top-auto md:top-4 left-auto md:left-4 bottom-5 right-5 z-[1000] rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-500 ${
          pulsing ? "pulse" : ""
        } ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        title="Find My Location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m8-9h1M3 12H2m9-9a9 9 0 110 18 9 9 0 010-18zm0 4a5 5 0 100 10 5 5 0 000-10z"
          />
        </svg>
      </button>
    </>
  );
}

export default LocateControl;
