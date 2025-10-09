import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

export default function ZoomableMarker({ point, isClosest }) {
  const map = useMap();
  const markerRef = useRef();

  const handleClick = () => {
    map.flyTo([point.lat, point.lng], 13, { animate: true, duration: 1.5 });
    setTimeout(() => {
      map.flyTo(map.getCenter(), 10, { animate: true, duration: 1.5 });
    }, 5000);
  };

  const icon = new L.Icon({
    iconUrl: isClosest
      ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
      : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });

  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    // Apply bounce when closest, remove after delay
    if (isClosest) {
      el.classList.add("bounce");
      const timer = setTimeout(() => el.classList.remove("bounce"), 4000);
      return () => clearTimeout(timer);
    } else {
      el.classList.remove("bounce");
    }
  }, [isClosest]);

  return (
    <Marker
      ref={markerRef}
      position={[point.lat, point.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <strong>{point.name}</strong>
        <br />
        {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
      </Popup>
    </Marker>
  );
}
