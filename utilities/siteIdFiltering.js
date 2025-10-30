export function filterSiteId(fullCoords) {
  if (typeof fullCoords !== "string") {
    return { coords: null, name: null };
  }

  // List of known operator tags — extend this as needed
  const operators = [
    "IHS",
    "MTN",
    "AIRTEL",
    "GLO",
    "9MOBILE",
    "HUAWEI",
    "Starting",
  ];

  // Find which operator tag appears first in the string
  const foundOperator = operators.find((op) => fullCoords.includes(op));

  if (!foundOperator) {
    // No known operator found — return as-is
    return { coords: null, name: fullCoords.trim() };
  }

  const splitIndex = fullCoords.indexOf(foundOperator);
  const coordsStr = fullCoords.slice(0, splitIndex).trim();
  const name = fullCoords.slice(splitIndex).trim();

  // Try to parse coordinates safely
  const [lat, lng] = coordsStr.split(",").map(Number);
  const isValidCoords = !isNaN(lat) && !isNaN(lng) && coordsStr.includes(",");

  return {
    coords: isValidCoords ? { lat, lng } : null,
    name,
  };
}
