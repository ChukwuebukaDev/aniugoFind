import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useMemo, useState } from "react";
import { navigateToPoint } from "../../utilities/navigationToPoint";
import ConfirmModal from "../../utilities/Notifications/ConfirmModal";
import { Compass } from "lucide-react";
const MapboxAccess = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function ZoomableMarker({ point, isClosest }) {
  const map = useMap();
  const markerRef = useRef();
  const [showConfirm, setShowConfirm] = useState(false);
  const [glow, setGlow] = useState(false);
  const [placeName, setPlaceName] = useState("Loading...");
  const handleClick = () => {
    map.flyTo([point.lat, point.lng], 13, { animate: true, duration: 1.5 });
  };

  useEffect(() => {
    if (!point?.lat || !point?.lng) return;

    const fetchPlace = async () => {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${point.lng},${point.lat}.json?access_token=${MapboxAccess}`);

        const data = await res.json();
        console.log("Reverse Geocoding Data:", data);

        const place = data.features?.[0]?.place_name;
        setPlaceName(place || "Unknown location");
      } catch (err) {
        console.error("Reverse Geocoding Failed", err);
        setPlaceName("Unable to fetch Location");
      }
    };

    fetchPlace();
  }, [point.lat, point.lng]);

  const icon = useMemo(
    () =>
      new L.Icon({
        iconUrl: isClosest
          ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
          : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28],
        className: glow ? "glow-marker" : "",
      }),
    [isClosest, glow],
  );

  // Bounce & glow effect
  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    if (isClosest) {
      // Add bounce class
      el.classList.add("bounce");
      // Add glow effect
      setGlow(true);
      const timer = setTimeout(() => {
        el.classList.remove("bounce");
        setGlow(false);
      }, 2400);
      return () => clearTimeout(timer);
    } else {
      el.classList.remove("bounce");
      setGlow(false);
    }
  }, [isClosest]);

  // Auto-open popup for closest marker
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isClosest && markerRef.current) {
        markerRef.current.openPopup();
        map.flyTo([point.lat, point.lng], 12, { animate: true, duration: 1.5 });
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isClosest, map, point.lat, point.lng]);

  // Confirm navigation
  const handleConfirm = () => {
    setShowConfirm(false);
    navigateToPoint(point);
  };

  return (
    <>
      <Marker
        key={point.name}
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
        eventHandlers={{ click: handleClick }}
      >
        <Popup>
          <div className="cursor-pointer font-medium flex flex-col gap-1">
            <p className="text-2xl mt-0 mb-0">{point.name}</p>
            <p className="m-0">{`${point.lat.toFixed(6)},${point.lng.toFixed(6)}`}</p>

            <p className="m-0">{placeName}</p>
            <button
              className="self-end animate-spin rounded-full p-1 bg-red-100 hover:bg-red-200 transition-colors"
              onClick={() => setShowConfirm(true)}
            >
              <Compass color="red" size={26} />
            </button>
            {isClosest && (
              <span className="mt-1 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                Closest Location
              </span>
            )}
          </div>
        </Popup>
      </Marker>

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