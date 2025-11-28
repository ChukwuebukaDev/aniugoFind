import { Marker, useMap } from "react-leaflet";
import { useState, useEffect, useMemo } from "react";
import Supercluster from "supercluster";

export default function ClusterLayer({
  points,
  renderMarker,
  clusterRadius = 60,
}) {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

  // Convert points to GeoJSON
  const geoPoints = useMemo(
    () =>
      points.map((p, index) => ({
        type: "Feature",
        properties: {
          cluster: false,
          index,
          ...p,
        },
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat],
        },
      })),
    [points]
  );

  const index = useMemo(
    () =>
      new Supercluster({
        radius: clusterRadius,
        maxZoom: 18,
      }).load(geoPoints),
    [geoPoints, clusterRadius]
  );

  // 🔥 Recompute clusters whenever map moves
  const updateClusters = () => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const newClusters = index.getClusters(bbox, zoom);
    setClusters(newClusters);
  };

  // Run once on mount
  useEffect(() => {
    updateClusters();
  }, []);

  // Run on map movement
  useEffect(() => {
    map.on("moveend", updateClusters);

    return () => {
      map.off("moveend", updateClusters);
    };
  }, [map, index]);

  return (
    <>
      {clusters.map((cluster, i) => {
        const [lng, lat] = cluster.geometry.coordinates;

        if (cluster.properties.cluster) {
          const count = cluster.properties.point_count;

          const icon = L.divIcon({
            html: `
              <div style="
                background:#4285F4;
                color:white;
                border-radius:50%;
                width:35px;
                height:35px;
                display:flex;
                justify-content:center;
                align-items:center;
                font-size:14px;
                box-shadow:0 0 8px rgba(0,0,0,0.3);
              ">
                ${count}
              </div>
            `,
            className: "cluster-marker",
            iconSize: [35, 35],
          });

          return (
            <Marker
              key={"cluster-" + cluster.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    index.getClusterExpansionZoom(cluster.id),
                    18
                  );
                  map.setView([lat, lng], expansionZoom, { animate: true });
                },
              }}
            />
          );
        }

        // A single marker
        return renderMarker(cluster.properties, i);
      })}
    </>
  );
}
