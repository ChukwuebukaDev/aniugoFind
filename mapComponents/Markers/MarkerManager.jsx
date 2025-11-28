import ZoomableMarker from "./ZoomableMarker";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { useAniugoBackgroundWatcher } from "../../utilities/useBackgroundWatcher.js";
import ClosestPointToast from "../../utilities/Notifications/ClosestPointToast.jsx";
export function MarkerLayer({
  points,
  autoCluster,
  bouncingMarkers,
  popupTarget,
}) {
  // 🔹 Get the closest point from background watcher
  const { closestPoint, toast } = useAniugoBackgroundWatcher();

  const isClosestMarker = (point) => {
    return (
      closestPoint &&
      point.lat === closestPoint.lat &&
      point.lng === closestPoint.lng
    );
  };

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

      return () => map.removeLayer(markers);
    }, [map, points, closestPoint]); // 🔹 include closestPoint to update cluster icons

    return null;
  };

  return (
    <>
      {autoCluster ? <ClusteredMarkers /> : renderZoomableMarkers()}

      <ClosestPointToast show={toast.show} message={toast.message} />
    </>
  );
}
