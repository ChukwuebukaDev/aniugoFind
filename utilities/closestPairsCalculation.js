import { getRoadDistance } from "./getRoadDistance";
import * as turf from "@turf/turf";
import { decodeRoute } from "../hooks/geometry";

const DEBUG = false;

// reduce floating precision (improves cache hit rate)
const normalizeCoord = (n) => Number(n.toFixed(6));

async function findClosestToStartRoad(points) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error("At least two points are required");
  }

  const start = {
    lat: normalizeCoord(points[0].lat),
    lng: normalizeCoord(points[0].lng),
  };

  const startPoint = turf.point([start.lng, start.lat]);

  let approxMinDistance = Infinity;
  let closestPoint = null;

  const debugDistances = [];

  // STEP 1: Fast straight-line distance filtering
  for (let i = 1; i < points.length; i++) {
    const candidate = {
      lat: normalizeCoord(points[i].lat),
      lng: normalizeCoord(points[i].lng),
    };

    const candidatePoint = turf.point([candidate.lng, candidate.lat]);

    const approxDistance = turf.distance(startPoint, candidatePoint, {
      units: "kilometers",
    });

    if (DEBUG) {
      debugDistances.push({
        point: candidate,
        approxDistance,
      });
    }

    if (approxDistance < approxMinDistance) {
      approxMinDistance = approxDistance;
      closestPoint = candidate;
    }
  }

  // Safety guard
  if (!closestPoint) {
    return {
      pair: null,
      distance: null,
      approxDistance: null,
      routeLine: [],
      debug: DEBUG ? debugDistances : undefined,
    };
  }

  // STEP 2: Fetch real road distance from ORS
  let roadDistance = approxMinDistance;
  let routeLine = [];

  try {
    const result = await getRoadDistance(start, closestPoint);

    if (result?.distance) {
      roadDistance = result.distance;
    }

    if (result?.geometry) {
      routeLine = decodeRoute(result.geometry);
    }
  } catch (error) {
    console.error("Road distance fetch failed:", error);
  }

  return {
    pair: [start, closestPoint],
    distance: roadDistance,
    approxDistance: approxMinDistance,
    routeLine,
    debug: DEBUG ? debugDistances : undefined,
  };
}

export { findClosestToStartRoad };