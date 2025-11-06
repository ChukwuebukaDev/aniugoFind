const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY; // ✅ loads from .env

export async function getRoadDistance(pointA, pointB) {
  if (!ORS_API_KEY) throw new Error("OpenRouteService API key missing");

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pointA.lng},${pointA.lat}&end=${pointB.lng},${pointB.lat}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features?.[0]) throw new Error("No route found");

    const summary = data.features[0].properties.summary;
    return {
      distance: summary.distance, // meters
      duration: summary.duration, // seconds
      geometry: data.features[0].geometry, // optional, for route drawing
    };
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return null;
  }
}
