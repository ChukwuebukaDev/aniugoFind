import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export default function RoadRouting({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length < 2) return;

    const waypoints = points.map((p) => L.latLng(p.lat, p.lng));

    const routingControl = L.Routing.control({
      waypoints,
      lineOptions: {
        styles: [{ color: "#1976d2", weight: 3 }],
      },
      createMarker: () => null,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      collapsible: false,
      containerClassName: "hidden",
    }).addTo(map);

    routingControl.on("routesfound", function (e) {
      const route = e.routes[0];
      const totalDistance = route.summary.totalDistance; // in meters
      console.log("Total distance:", formatDistance(totalDistance));
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [points, map]);

  return null;
}
