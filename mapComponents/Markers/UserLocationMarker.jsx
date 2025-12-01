import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";

const pulsingIcon = L.divIcon({
  className: "user-pulse-icon",
  iconSize: [20, 20],
  html: `
    <div class="relative w-5 h-5">
      <span class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></span>
      <span class="absolute inset-0 rounded-full bg-blue-600 border border-white shadow-md"></span>
    </div>
  `,
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

export default function UserLocationMarker({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;

    const currentCenter = map.getCenter();
    const target = L.latLng(userLocation.lat, userLocation.lng);

    // Only fly if user moved significantly (>50m or so)
    if (currentCenter.distanceTo(target) > 50) {
      map.flyTo(target, 12, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [userLocation, map]);

  if (!userLocation) return null;

  return (
    <Marker position={[userLocation.lat, userLocation.lng]} icon={pulsingIcon}>
      <Popup>You are here 📍</Popup>
    </Marker>
  );
}
