import { useState } from "react";
import { useMapEvents } from "react-leaflet";
function MapClickHandler({ onAdd }) {
  const [clickPos, setClickPos] = useState(null);
  const [name, setName] = useState("");

  useMapEvents({
    click(e) {
      setClickPos(e.latlng);
      setName("");
    },
  });

  const handleAdd = () => {
    if (clickPos) {
      onAdd({ ...clickPos, name: name.trim() || `Point ${Date.now()}` });
      setClickPos(null);
      setName("");
    }
  };

  return (
    <>
      {clickPos && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-[1000]">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[320px] animate-fadeIn">
            <h2 className="font-semibold text-lg mb-3 text-center">
              Name this location
            </h2>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={() => setClickPos(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAdd}
              >
                Add Point
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default MapClickHandler;
