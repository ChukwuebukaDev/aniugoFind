import { useEffect } from "react";
// Center map on user's current location when available
function LocateUser({ useMap }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 13, {
          animate: true,
          duration: 2,
        });

        // Optional: Add a marker for current location
        const userMarker = L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();

        return () => {
          map.removeLayer(userMarker);
        };
      },
      (err) => {
        console.warn("Could not get location:", err.message);
      },
      { enableHighAccuracy: true }
    );
  }, [map]);

  return null;
}
export default LocateUser;
