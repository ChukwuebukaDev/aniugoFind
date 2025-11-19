import ZoomableMarker from "./ZoomableMarker";
import MarkerClusterGroup from "react-leaflet-cluster";
export function MarkerLayer({
  points,
  autoCluster,
  bouncingMarkers,
  isClosestMarker,
  popupTarget,
}) {
  const renderMarkers = () =>
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

  return autoCluster ? (
    <MarkerClusterGroup>{renderMarkers()}</MarkerClusterGroup>
  ) : (
    <>{renderMarkers()}</>
  );
}
