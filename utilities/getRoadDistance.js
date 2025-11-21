export async function getRoadDistance(pointA, pointB) {
  if (!pointA || !pointB) throw new Error("Invalid coordinates");

  const start = `${pointA.lng},${pointA.lat}`;
  const end = `${pointB.lng},${pointB.lat}`;

  try {
    // Call your local backend server
    const res = await fetch(
      `http://localhost:3001/route?start=${start}&end=${end}`
    );
    if (!res.ok) throw new Error("Backend request failed");

    const data = await res.json();

    if (!data.features?.[0]) throw new Error("No route found");

    const summary = data.features[0].properties.summary;

    return {
      distance: summary.distance, // meters
      duration: summary.duration, // seconds
      geometry: data.features[0].geometry, // optional, for drawing the route
    };
  } catch (error) {
    console.error("Error fetching road distance:", error);
    return null;
  }
}
