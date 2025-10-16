import { useState } from "react";
import { useMap, Marker, Circle } from "react-leaflet";
import L from "leaflet";

function LocateControl() {
  const map = useMap();
  const [pulsing, setPulsing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    setPulsing(true);
    setTimeout(() => setPulsing(false), 1200);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        map.flyTo([latitude, longitude], 13, { animate: true, duration: 2 });
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
      {userLocation && (
        <>
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          />
          <Circle center={userLocation} radius={100} />
        </>
      )}

      <button
        onClick={handleLocate}
        className={`cursor-pointer fixed md:absolute top-auto md:top-8 left-auto md:left-4 bottom-1/3 right-5 z-[1000] rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-500 ${
          pulsing ? "pulse" : ""
        }`}
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
