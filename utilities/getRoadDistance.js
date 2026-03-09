const BACKEND_URL = "https://aniugofind-backend.onrender.com/route";

// Cache store
const routeCache = new Map();
const pendingRequests = new Map();
const MAX_CACHE_SIZE = 200;

// Normalize coordinates for stable caching
const normalizeCoord = (num) => Number(num.toFixed(6));

export async function getRoadDistance(pointA, pointB) {
  if (!pointA || !pointB) throw new Error("Invalid coordinates");

  const startLng = normalizeCoord(pointA.lng);
  const startLat = normalizeCoord(pointA.lat);
  const endLng = normalizeCoord(pointB.lng);
  const endLat = normalizeCoord(pointB.lat);

  const start = `${startLng},${startLat}`;
  const end = `${endLng},${endLat}`;

  const cacheKey = `${start}-${end}`;

  // Return cached result
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  // Prevent duplicate simultaneous requests
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const requestPromise = (async () => {
    try {
      const res = await fetch(`${BACKEND_URL}?start=${start}&end=${end}`);

      if (!res.ok) throw new Error(`Backend request failed: ${res.status}`);

      const data = await res.json();

      if (!data?.routes?.[0]) throw new Error("No route found");

      const route = data.routes[0];

      const result = {
        distance: route.distance,       // meters
        duration: route.duration,       // seconds
        geometry: route.geometry,       // GeoJSON LineString
        steps: route.legs?.[0]?.steps || [],
      };

      // Maintain cache size
      if (routeCache.size >= MAX_CACHE_SIZE) {
        const firstKey = routeCache.keys().next().value;
        routeCache.delete(firstKey);
      }

      routeCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error fetching road distance:", error);
      return null;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}