import { useState } from "react";
import { useMapEvents } from "react-leaflet";
function MapClickHandler({ onAdd }) {
  const [clickPos, setClickPos] = useState(null);

  const handleAdd = () => {
    if (clickPos) {
      onAdd({ ...clickPos });
      setClickPos(null);
    }
  };
  useMapEvents({
    click(e) {
      setClickPos(e.latlng);
      handleAdd();
    },
  });
  return null;
}
export default MapClickHandler;
