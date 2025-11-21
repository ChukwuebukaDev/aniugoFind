const BACKEND_URL = "https://aniugofind-production.up.railway.app/route";

// Simple cache object
const routeCache = {};

export async function getRoadDistance(pointA, pointB) {
  if (!pointA || !pointB) throw new Error("Invalid coordinates");

  const start = `${pointA.lng},${pointA.lat}`;
  const end = `${pointB.lng},${pointB.lat}`;

  // Create a unique key for the route
  const cacheKey = `${start}-${end}`;

  // Return cached result if exists
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }

  try {
    // Call the Railway backend
    const res = await fetch(`${BACKEND_URL}?start=${start}&end=${end}`);
    if (!res.ok) throw new Error("Backend request failed");

    const data = await res.json();

    if (!data.features?.[0]) throw new Error("No route found");

    const summary = data.features[0].properties.summary;

    const result = {
      distance: summary.distance, // meters
      duration: summary.duration, // seconds
      geometry: data.features[0].geometry, // optional, for drawing the route
    };

    // Store in cache
    routeCache[cacheKey] = result;

    return result;
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return null;
  }
}
