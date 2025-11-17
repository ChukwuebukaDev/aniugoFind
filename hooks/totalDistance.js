import { getRoadDistance } from "../utilities/getRoadDistance";

// 🔥 Route cache (full sequence of points)
// key = JSON.stringify(points)
const totalDistanceCache = {};

// 🔥 Segment cache (distance between A → B)
// key = "latA,lngA_latB,lngB"
const segmentCache = {};

// Cache expiration in milliseconds (10 minutes)
const CACHE_EXPIRE = 10 * 60 * 1000;

function makeSegmentKey(a, b) {
  return `${a.lat},${a.lng}_${b.lat},${b.lng}`;
}

/**
 * Calculate total road distance between ordered points.
 * Uses segment caching + full route caching.
 */
export async function getTotalDistance(points) {
  if (!points || points.length < 2) return 0;

  const routeKey = JSON.stringify(points);

  // 1️⃣ Full route cache check
  const cached = totalDistanceCache[routeKey];
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRE) {
    return cached.totalDistance;
  }

  let total = 0;

  // 2️⃣ Loop segments
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];

    const segKey = makeSegmentKey(from, to);

    // 2A — segment cache hit
    if (
      segmentCache[segKey] &&
      Date.now() - segmentCache[segKey].timestamp < CACHE_EXPIRE
    ) {
      total += segmentCache[segKey].distance;
      continue;
    }

    // 2B — fetch from ORS
    const result = await getRoadDistance(from, to);
    const dist = result?.distance || 0;

    // Save in segment cache
    segmentCache[segKey] = {
      distance: dist,
      timestamp: Date.now(),
    };

    total += dist;
  }

  // 3️⃣ Save full route cache
  totalDistanceCache[routeKey] = {
    totalDistance: total,
    timestamp: Date.now(),
  };

  return `${(total / 1000).toFixed(1)}km`;
}
