import { getRoadDistance } from "./getRoadDistance";
import * as turf from "@turf/turf";
import { decodeRoute } from "../hooks/geometry";

async function findClosestToStartRoad(points) {
  if (!points || points.length < 2) {
    throw new Error("At least two points are required");
  }

  const start = points[0];
  const startPoint = turf.point([start.lng, start.lat]);

  let approxMin = Infinity;
  let closest = null;
  const debugDistances = [];

  // Step 1: Turf straight-line distance (fast filter)
  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const currentPoint = turf.point([current.lng, current.lat]);

    const approxDist = turf.distance(startPoint, currentPoint, {
      units: "kilometers",
    });

    // Save for debugging
    debugDistances.push({
      point: current,
      approxDistance: approxDist,
    });

    if (approxDist < approxMin) {
      approxMin = approxDist;
      closest = current;
    }
  }

  // Step 2: Use ORS only for the best match
  let roadDistance = approxMin;
  let routeLine = [];

  try {
    if (closest) {
      const result = await getRoadDistance(start, closest);
      if (result?.distance) {
        roadDistance = result.distance;
      }
      if (result?.geometry) {
        routeLine = decodeRoute(result.geometry);
      }
    }
  } catch (err) {
    console.error("ORS error:", err);
  }

  return {
    pair: [start, closest],
    distance: roadDistance,
    approxDistance: approxMin,
    debug: debugDistances, // remove in production if needed
    routeLine,
  };
}

export { findClosestToStartRoad };
