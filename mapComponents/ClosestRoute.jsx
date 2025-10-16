import { useEffect, useState } from "react";
import { useMap, Tooltip, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export default function ClosestRoute({ closestPair }) {
  const map = useMap();
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [midpoint, setMidpoint] = useState(null);

  useEffect(() => {
    if (!closestPair || closestPair.length < 2) return;

    const [start, end] = closestPair;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[1], start[0]), L.latLng(end[1], end[0])],
      lineOptions: { styles: [{ color: "red", weight: 3, dashArray: "5,10" }] },
      createMarker: () => null, // no marker
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, // hide directions panel
    }).addTo(map);

    routingControl.on("routesfound", (e) => {
      const route = e.routes[0];
      setDistance(route.summary.totalDistance);

      const coords = route.coordinates.map((c) => [c.lat, c.lng]);
      setRouteCoords(coords);

      const midIndex = Math.floor(coords.length / 2);
      setMidpoint(coords[midIndex]);
    });

    return () => map.removeControl(routingControl);
  }, [closestPair, map]);

  return (
    <>
      {routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: "red", weight: 3, dashArray: "5,10" }}
        >
          {midpoint && distance && (
            <Tooltip
              direction="center"
              permanent
              offset={[0, -10]}
              interactive={false}
            >
              {formatDistance(distance)}
            </Tooltip>
          )}
        </Polyline>
      )}
    </>
  );
}
