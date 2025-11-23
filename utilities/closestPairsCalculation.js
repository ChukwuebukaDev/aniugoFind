import { getRoadDistance } from "./getRoadDistance";

async function findClosestToStartRoad(points) {
  if (!points || points.length < 2) {
    throw new Error("At least two points are required");
  }

  const start = points[0];
  let minDistance = Infinity;
  let closest = null;
  const distanceBox = [];

  for (let i = 1; i < points.length; i++) {
    try {
      const result = await getRoadDistance(start, points[i]);
      if (!result) continue;

      const { distance } = result;

      // Store every distance for debugging
      distanceBox.push({ point: points[i], distance });

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
