import { useEffect } from "react";
import { useMap } from "react-leaflet";
import ZoomableMarker from "./ZoomableMarker";
import L from "leaflet";
import "leaflet.markercluster";

export function MarkerLayer({
  points,
  autoCluster,
  bouncingMarkers,
  isClosestMarker,
  popupTarget,
}) {
  const renderZoomableMarkers = () =>
    points.map((p, idx) => {
      const isClosest = isClosestMarker(p);
      const isBouncing = bouncingMarkers.includes(p.name);
      const key = p.isUser
        ? "user-location"
        : p.name || `${p.lat}-${p.lng}-${idx}`;
      return (
        <ZoomableMarker
          key={key}
          point={p}
          isClosest={isClosest}
          isBouncing={isBouncing}
          openPopup={popupTarget === p.name}
        />
      );
    });

  const ClusteredMarkers = () => {
    const map = useMap();

    useEffect(() => {
      if (!autoCluster) return;

      const markers = L.markerClusterGroup();

      points.forEach((p) => {
        const isClosest = isClosestMarker(p);

        // Custom icon for closest marker
        const icon = new L.Icon({
          iconUrl: isClosest
            ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -28],
        });

        const marker = L.marker([p.lat, p.lng], { icon }).bindPopup(p.name);
        markers.addLayer(marker);
      });

      map.addLayer(markers);

      // Cleanup on unmount
      return () => map.removeLayer(markers);
    }, [map, points]);

    return null;
  };

  return autoCluster ? <ClusteredMarkers /> : <>{renderZoomableMarkers()}</>;
}
