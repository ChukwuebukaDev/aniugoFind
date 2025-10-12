import { useEffect, useState, useRef } from "react";

const InfoCard = ({ onClose, results, points }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 }); // starting offset (24px = Tailwind bottom-6/left-6)
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse/touch events
  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    offset.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    setPosition({
      x: clientX - offset.current.x,
      y: clientY - offset.current.y,
    });
  };

  const endDrag = () => setDragging(false);

  // Close animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 500);
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onMouseMove={onDrag}
      onTouchMove={onDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchEnd={endDrag}
      className={`fixed z-[1000] max-w-xs w-full sm:max-w-sm cursor-grab active:cursor-grabbing
        transition-all duration-500 ease-in-out
        ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      style={{ left: `${position.x}px`, bottom: `${position.y}px` }}
    >
      <div className="bg-black/30 backdrop-blur-md shadow-lg  border border-gray-200 p-2 text-gray-800 font-semibold">
        <div className="flex justify-between items-center mb-3 select-none">
          <h2 className="text-lg font-semibold">Results</h2>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-1 text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              ❌
            </button>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Location Count:</span>{" "}
            {points.length || 0}
          </p>
          <p>
            <span className="font-medium">Total Distance:</span>{" "}
            {(results && `${results.totalDistance.toFixed(2)} km`) || " 0 km"}
          </p>
          <p>
            <span className="font-medium">Closest Pair:</span>
            {(results && `${results.minDist.toFixed(3)} km apart`) || " none"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
