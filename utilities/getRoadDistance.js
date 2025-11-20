const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY; // optional fallback for local dev

export async function getRoadDistance(pointA, pointB) {
  if (!pointA || !pointB) throw new Error("Invalid coordinates");

  // format: lng,lat
  const start = `${pointA.lng},${pointA.lat}`;
  const end = `${pointB.lng},${pointB.lat}`;

  // ---- CALL YOUR PROXY, NOT ORS ----
  const url = `/api/ors?start=${start}&end=${end}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Proxy request failed");

    const data = await res.json();
    if (!data.features?.[0]) throw new Error("No route found");

    const summary = data.features[0].properties.summary;

    return {
      distance: summary.distance, // meters
      duration: summary.duration, // seconds
      geometry: data.features[0].geometry,
    };
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return null;
  }
}
