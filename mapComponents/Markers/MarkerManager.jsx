import ZoomableMarker from "./ZoomableMarker";
import "leaflet.markercluster";
import { useAniugoBackgroundWatcher } from "../../utilities/useBackgroundWatcher.js";
import ClosestPointToast from "../../utilities/Notifications/ClosestPointToast.jsx";
import ClusterLayer from "../Cluster/Clusterlayer.jsx";
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

  return (
    <>
      {autoCluster ? (
        <ClusterLayer
          points={points}
          renderMarker={(p, i) => {
            const isClosest = isClosestMarker(p);
            const isBouncing = bouncingMarkers.includes(p.name);

            return (
              <ZoomableMarker
                key={p.name || `${p.lat}-${p.lng}-${i}`}
                point={p}
                isClosest={isClosest}
                isBouncing={isBouncing}
                openPopup={popupTarget === p.name}
              />
            );
          }}
        />
      ) : (
        renderZoomableMarkers()
      )}

      <ClosestPointToast show={toast.show} message={toast.message} />
    </>
  );
}
