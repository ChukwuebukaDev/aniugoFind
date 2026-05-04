import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  isUser?: boolean;
  arrival?: "pending" | "arrived";
};

type Props = {
  points: MapPoint[];
  radius: number;
  center?: { lat: number; lng: number };
  onCountChange?: (count: number) => void;
};
export default function RadiusClusterOverlay({
  points,
  radius = 500,
  center,
  onCountChange,
}: Props) {
  const map = useMap();
  const circleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const activeCenter = useMemo(() => {
    if (center) return center;
    const c = map.getCenter();
    return { lat: c.lat, lng: c.lng };
  }, [center, map]);

  const pointsInRadius = useMemo(() => {
    if (!map || !points.length) return [];

    return points.filter((p) => {
      const distance = map.distance(
        [activeCenter.lat, activeCenter.lng],
        [p.lat, p.lng],
      );

      return distance <= radius;
    });
  }, [points, radius, activeCenter, map]);

  useEffect(() => {
    onCountChange?.(pointsInRadius.length);
  }, [pointsInRadius, onCountChange]);

  useEffect(() => {
    if (!map) return;

    if (circleRef.current) {
      circleRef.current.remove();
    }

    circleRef.current = L.circle([activeCenter.lat, activeCenter.lng], {
      radius,
      color: "#FFD700",
      fillOpacity: 0.15,
    }).addTo(map);

    return () => {
      circleRef.current?.remove();
    };
  }, [map, activeCenter, radius]);

  useEffect(() => {
    if (!map) return;

    // cleanup old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pointsInRadius.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        color: "#22c55e",
        fillOpacity: 0.9,
      }).addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [pointsInRadius, map]);

  return null;
}
