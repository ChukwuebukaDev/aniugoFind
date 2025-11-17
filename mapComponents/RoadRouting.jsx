import { useEffect, useState } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import polyline from "@mapbox/polyline";
import { getRoadDistance } from "../utilities/getRoadDistance";

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export default function RoadRouting({ points }) {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (!points || points.length < 2) return;

    let cancelled = false;

    const computeRoutes = async () => {
      const newRoutes = [];

      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];

        const result = await getRoadDistance(from, to);
        if (!result?.geometry) continue;

        // decode ORS geometry (polyline) → [[lat,lng], ...]
        const decoded = polyline.decode(result.geometry);
        if (!decoded || decoded.length === 0) continue;

        // convert to {lat,lng} objects for Leaflet
        const coords = decoded.map(([lat, lng]) => ({ lat, lng }));
        if (coords.length === 0) continue;

        const midpoint = coords[Math.floor(coords.length / 2)];

        newRoutes.push({
          coordinates: coords,
          distance: result.distance,
          midpoint,
        });
      }

      if (!cancelled) setRoutes(newRoutes);
    };

    computeRoutes();

    return () => {
      cancelled = true;
    };
  }, [points]);

  return (
    <>
      {routes.map((route, idx) =>
        route.coordinates && route.coordinates.length > 0 ? (
          <Polyline
            key={idx}
            positions={route.coordinates}
            pathOptions={{ color: "#1976d2", weight: 3 }}
          >
            <Tooltip permanent direction="center" offset={[0, -10]}>
              {formatDistance(route.distance)}
            </Tooltip>
          </Polyline>
        ) : null
      )}
    </>
  );
}
