import { useState } from "react";
import { Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";

export default function CircleSelectionHandler({ points, onSelect }) {
  const [center, setCenter] = useState(null);
  const [radius, setRadius] = useState(0);

  useMapEvents({
    mousedown(e) {
      setCenter(e.latlng);
      setRadius(0);
    },

    mousemove(e) {
      if (!center) return;
      setRadius(e.latlng.distanceTo(center));
    },

    mouseup() {
      if (!center) return;

      const selected = points.filter((p) => {
        return L.latLng(p.lat, p.lng).distanceTo(center) <= radius;
      });

      onSelect(selected);
      setCenter(null);
      setRadius(0);
    },
  });

  if (!center || radius === 0) return null;

  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: "#2563eb",
        dashArray: "6",
        fillOpacity: 0.1,
      }}
    />
  );
}
