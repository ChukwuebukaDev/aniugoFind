import { useEffect } from "react";
import { useMap } from "react-leaflet";
// Center map on user's current location when available
function LocateUser() {
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
