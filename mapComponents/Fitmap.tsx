import { useEffect } from "react";
import { useMap } from "react-leaflet";



export interface MarkerPoint {
  lat: number;
  lng: number;
  [key: string]: any;
}

type MarkerBounds = [number, number][]; 

interface FitmapHandlerProps {
  markers: MarkerPoint[];
}


export default function FitmapHandler({ markers }: FitmapHandlerProps): null {
  const map = useMap();

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
      }
    };

    window.addEventListener("fitToMarkers", handleRestoreFit);
    return () => window.removeEventListener("fitToMarkers", handleRestoreFit);
  }, [map]);

  return null;
}
