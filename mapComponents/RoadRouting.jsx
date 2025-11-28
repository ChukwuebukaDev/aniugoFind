import { useEffect, useState } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import polyline from "@mapbox/polyline";
import * as turf from "@turf/turf";
import { getRoadDistance } from "../utilities/getRoadDistance";

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export default function RoadRouting({ points }) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!points || points.length < 2) return;

    let cancelled = false;

    const computeRoute = async () => {
      try {
        const start = points[0];
        const startPoint = turf.point([start.lng, start.lat]);

        let closest = null;
        let minDist = Infinity;

        // Find closest point using Turf
        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          const tp = turf.point([p.lng, p.lat]);
          const dist = turf.distance(startPoint, tp, { units: "kilometers" });

          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
        }

        if (!closest) return;

        // ORS route
        const result = await getRoadDistance(start, closest);
        if (!result) return;

        let coords = [];

        // ✅ If geometry is encoded polyline
        if (typeof result.geometry === "string") {
          coords = polyline
            .decode(result.geometry)
            .map(([lat, lng]) => [lat, lng]);
        }

        // ✅ If geometry is GeoJSON
        if (result.geometry?.coordinates) {
          coords = result.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        }

        if (!coords.length) {
          console.warn("No route coords decoded");
          return;
        }

        const midpoint = coords[Math.floor(coords.length / 2)];

        if (!cancelled) {
          setRoute({
            coordinates: coords, // now [lat,lng]
            distance: result.distance,
            midpoint,
          });
        }
      } catch (err) {
        console.error("Route error:", err);
      }
    };

    computeRoute();

    return () => {
      cancelled = true;
    };
  }, [points]);

  if (!route || !route.coordinates?.length) return null;

  return (
    <>
      {points?.length > 1 && (
        <Polyline
          positions={route.coordinates}
          pathOptions={{ color: "dodgerblue", weight: 4 }}
        >
          <Tooltip permanent direction="center" offset={[0, -10]}>
            <div className="bg-emerald-400 p-1 font-bold  flex flex-col items-center">
              <strong>Closest Point</strong>
              {formatDistance(route.distance)}
            </div>
          </Tooltip>
        </Polyline>
      )}
    </>
  );
}
