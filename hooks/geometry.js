import polyline from "@mapbox/polyline";

export function decodeRoute(encoded) {
  return polyline.decode(encoded).map(([lat, lng]) => [lat, lng]);
}
