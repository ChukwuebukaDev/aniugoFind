import { useState, useEffect } from "react";
import { X, Save, Trash2, MapPin } from "lucide-react";

const SavedCoordinatesSidebar = ({
  isOpen,
  onClose,
  coordinates,
  onLoadSavedSet,
}) => {
  const [savedSets, setSavedSets] = useState([]);
  const [setName, setSetName] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("savedCoordinateSets")) || [];
    setSavedSets(stored);
  }, []);

  // Save to localStorage whenever savedSets change
  useEffect(() => {
    localStorage.setItem("savedCoordinateSets", JSON.stringify(savedSets));
  }, [savedSets]);

  const handleSave = () => {
    if (!setName.trim()) return alert("Please enter a name for this set.");
    if (!coordinates.length) return alert("No coordinates to save!");

    const exists = savedSets.some((set) => set.name === setName.trim());
    if (exists) return alert("A set with that name already exists.");

    const newSet = { name: setName.trim(), coordinates };
    const updated = [...savedSets, newSet];
    setSavedSets(updated);
    setSetName("");
  };

  const handleLoad = (set) => {
    onLoadSavedSet(set.coordinates);
    onClose();
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete saved set "${name}"?`)) {
      const updated = savedSets.filter((set) => set.name !== name);
      setSavedSets(updated);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-white/95 shadow-2xl p-4 z-[1000] transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Saved Coordinates
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Save section */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
          placeholder="Set name..."
          className="flex-grow border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Saved sets list */}
      <div className="space-y-2 overflow-y-auto max-h-[80vh] pr-1">
        {savedSets.length === 0 ? (
          <p className="text-gray-500 text-sm">No saved coordinate sets yet.</p>
        ) : (
          savedSets.map((set) => (
            <div
              key={set.name}
              className="border rounded-md p-2 flex justify-between items-center hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{set.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleLoad(set)}
                  className="text-green-600 hover:text-green-700 p-1"
                  title="Load this set"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(set.name)}
                  className="text-red-500 hover:text-red-600 p-1"
                  title="Delete this set"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedCoordinatesSidebar;
