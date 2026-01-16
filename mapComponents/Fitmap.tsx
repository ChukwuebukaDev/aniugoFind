import { useEffect } from "react";
import { useMap } from "react-leaflet";

/* -------------------------------------------------
   Types
-------------------------------------------------- */

export interface MarkerPoint {
  lat: number;
  lng: number;
  [key: string]: any;
}

type MarkerBounds = [number, number][]; // safe replacement for LatLngBoundsExpression

interface FitmapHandlerProps {
  markers: MarkerPoint[];
}

/* -------------------------------------------------
   Component
-------------------------------------------------- */

export default function FitmapHandler({ markers }: FitmapHandlerProps): null {
  const map = useMap();

  /* Fit map on markers update */
  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const points: MarkerBounds = markers.map((p) => [p.lat, p.lng]);

    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60] });
    } catch {
      // map might not be ready yet
    }
  }, [map, markers]);

  /* Restore fit from custom event */
  useEffect(() => {
    const handleRestoreFit = (e: Event) => {
      const custom = e as CustomEvent<MarkerPoint[]>;
      const list = custom.detail;

      if (!list || list.length === 0) return;

      const points: MarkerBounds = list.map((p) => [p.lat, p.lng]);
      const bounds = L.latLngBounds(points);

      try {
        map.fitBounds(bounds, { padding: [60, 60] });
      } catch {
        // ignore if map not ready
      }
    };

    window.addEventListener("fitToMarkers", handleRestoreFit);
    return () => window.removeEventListener("fitToMarkers", handleRestoreFit);
  }, [map]);

  return null;
}
