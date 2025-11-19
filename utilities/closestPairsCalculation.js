import { getRoadDistance } from "./getRoadDistance";
async function findClosestToStartRoad(points) {
  const start = points[0];
  let minDistance = Infinity;
  let closest = null;

  for (let i = 1; i < points.length; i++) {
    try {
      const distance = await getRoadDistance(start, points[i]);

      if (distance < minDistance) {
        minDistance = distance;
        closest = points[i];
      }
    } catch (err) {
      console.error("ORS error:", err);
    }
  }

  return {
    pair: [start, closest],
    distance: minDistance,
  };
}
export { findClosestToStartRoad };
