import { useEffect } from "react";
function Fitmap({ markers, useMap }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const group = L.featureGroup(
        markers.map((m) => L.marker([m.lat, m.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.3));
    }
  }, [markers, map]);
  return null;
}
export default Fitmap;
