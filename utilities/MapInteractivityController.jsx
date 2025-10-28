import { useMap } from "react-leaflet";
import { useEffect } from "react";
export default function MapInteractivityController({ disabled }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const methods = [
      "dragging",
      "scrollWheelZoom",
      "doubleClickZoom",
      "boxZoom",
      "keyboard",
      "touchZoom",
    ];
    methods.forEach(
      (m) => map[m] && (disabled ? map[m].disable() : map[m].enable())
    );
  }, [map, disabled]);

  return null;
}
