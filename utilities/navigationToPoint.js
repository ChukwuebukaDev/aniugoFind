export function navigateToPoint(point, travelMode = "driving") {
  if (!point || !point.lat || !point.lng) return;

  const url = `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}&travelmode=${travelMode}`;

  // Open in a new tab
  window.open(url, "_blank");
}
