import { useCallback } from "react";
function findClosestPair(points = []) {
  if (points.length < 2) return null;
  let minDist = Infinity;
  let pair = null;
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dx = a.lat - b.lat;
      const dy = a.lng - b.lng;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        pair = [a, b];
      }
    }
  }
  return pair;
}

const calculateResults = useCallback(
  (pointList) => {
    if (!pointList || pointList.length < 2) {
      setResults(null);
      return;
    }
    const pair = findClosestPair(pointList);
    if (!pair) {
      setResults(null);
      return;
    }

    setResults({ closestPair: pair });
    const [a, b] = pair;

    const bouncing = pointList.filter(
      (p) =>
        (Math.abs(p.lat - a.lat) < 1e-6 && Math.abs(p.lng - a.lng) < 1e-6) ||
        (Math.abs(p.lat - b.lat) < 1e-6 && Math.abs(p.lng - b.lng) < 1e-6)
    );

    setBouncingMarkers(bouncing.map((b) => b.name));
    const timeout = setTimeout(() => setBouncingMarkers([]), 4000);
    return () => clearTimeout(timeout);
  },
  [setResults]
);

export { calculateResults };
