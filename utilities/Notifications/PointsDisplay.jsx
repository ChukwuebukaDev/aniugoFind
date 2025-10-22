import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function PointsDisplay({
  points,
  closePoints,
  deletePoint,
  zoomToPoint, // 👈 new prop from parent map component
}) {
  const [confirmIndex, setConfirmIndex] = useState(null);

  const handleDeleteClick = (i) => {
    setConfirmIndex(i);
  };

  const handleConfirm = () => {
    deletePoint(confirmIndex);
    setConfirmIndex(null);
  };

  const handleCancel = () => {
    setConfirmIndex(null);
  };

  const handlePointClick = (p, i) => {
    // Ignore click if it was on the ❌ button
    if (confirmIndex !== null) return;
    if (zoomToPoint) zoomToPoint(p.lat, p.lng);
  };

  return (
    !closePoints && (
      <div className="absolute text-white font-semibold rounded-2xl p-1.5 -translate-x-1/2 -translate-y-1/2 top-1/2 topper left-1/2 sm:w-md m-auto bg-black/70 max-h-[75vh] overflow-y-auto shadow-xl xsm">
        <h3>📍 Points</h3>
        <ul className="list-none p-0">
          {points.map((p, i) => (
            <li
              key={i}
              onClick={() => handlePointClick(p, i)} // 👈 click = zoom to map
              className="flex justify-between items-center p-2.5 mb-1.5 hover:bg-gray-400 cursor-pointer bg-gray-500 transition-all"
              title={`Zoom to ${p.name}`}
            >
              <div className="flex flex-col">
                <span>
                  Name: <strong>{p.name}</strong>
                </span>
                <span>
                  Coords: — {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 👈 prevent zoom when clicking delete
                  handleDeleteClick(i);
                }}
                className="bg-transparent font-bold cursor-pointer text-amber-950 text-xl"
                title={`Delete ${p.name}`}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        {/* Reusable Confirmation Modal */}
        <ConfirmModal
          show={confirmIndex !== null}
          title={
            confirmIndex !== null
              ? `Delete "${points[confirmIndex].name}"?`
              : ""
          }
          message="This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    )
  );
}
