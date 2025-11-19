import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function FitmapHandler({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (!markers || markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((p) => [p.lat, p.lng]));
    try {
      map.fitBounds(bounds, { padding: [60, 60] });
    } catch (e) {
      // ignore if map not ready
    }
  }, [map, markers]);

  useEffect(() => {
    const handleRestoreFit = (e) => {
      const list = e.detail;
      if (!list || list.length === 0) return;
      const bounds = L.latLngBounds(list.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
    };
    window.addEventListener("fitToMarkers", handleRestoreFit);
    return () => window.removeEventListener("fitToMarkers", handleRestoreFit);
  }, [map]);

  return null;
}
