import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState, useMemo } from "react";
import { navigateToPoint } from "../../utilities/navigationToPoint";
import ConfirmModal from "../../utilities/Notifications/ConfirmModal";

export default function ZoomableMarker({ point, isClosest, openPopup }) {
  const map = useMap();
  const markerRef = useRef();
  const [showConfirm, setShowConfirm] = useState(false);

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

  // Bounce
  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    if (isClosest) {
      el.classList.add("bounce");
      const timer = setTimeout(() => el.classList.remove("bounce"), 2400);
      return () => clearTimeout(timer);
    } else {
      el.classList.remove("bounce");
    }
  }, [isClosest]);

  // Auto-open popup
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isClosest && markerRef.current) {
        markerRef.current.openPopup();
        map.flyTo([point.lat, point.lng], 12, { animate: true, duration: 1.5 });
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isClosest, map, point.lat, point.lng]);

  // 🚀 What happens after user confirms
  const handleConfirm = () => {
    setShowConfirm(false);
    navigateToPoint(point);
  };

  return (
    <>
      {/* Marker */}
      <Marker
        key={point.name}
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
        eventHandlers={{ click: handleClick }}
      >
        <Popup>
          <div
            onClick={() => setShowConfirm(true)}
            className="cursor-pointer font-medium flex flex-col gap-1"
          >
            <span>{point.name}</span>

            {isClosest && (
              <span className="mt-1 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                Closest Location
              </span>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Confirm modal */}
      <ConfirmModal
        show={showConfirm}
        title="Navigate to this point?"
        message={`Do you want to open navigation to ${point.name}?`}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        reply={"Yes"}
      />
    </>
  );
}
