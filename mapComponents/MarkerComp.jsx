import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useMemo } from "react";

export default function ZoomableMarker({ point, isClosest, openPopup }) {
  const map = useMap();
  const markerRef = useRef();

  const handleClick = () => {
    map.flyTo([point.lat, point.lng], 13, { animate: true, duration: 1.5 });
  };
  const icon = useMemo(
    () =>
      new L.Icon({
        iconUrl: isClosest
          ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28],
      }),
    [isClosest]
  );

  // 🔸 Bounce effect for closest markers
  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    let timer;
    if (isClosest) {
      el.classList.add("bounce");
      timer = setTimeout(() => el.classList.remove("bounce"), 4000);
    } else {
      el.classList.remove("bounce");
    }
    return () => {
      clearTimeout(timer);
      el.classList.remove("bounce");
    };
  }, [isClosest]);

  // 🔸 Automatically open popup when openPopup is true
  useEffect(() => {
    if (openPopup && markerRef.current) {
      markerRef.current.openPopup();
      map.flyTo([point.lat, point.lng], 12, { animate: true, duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPopup]);

  return (
    <Marker
      key={point.name}
      ref={markerRef}
      position={[point.lat, point.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Popup>
        <div className="bg-pink-500 p-1 rounded">
          <strong>{point.name}</strong>
          <br />
          <span className="text-xs">
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </span>
        </div>
      </Popup>
    </Marker>
  );
}
