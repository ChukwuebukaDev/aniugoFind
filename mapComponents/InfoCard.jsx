import { useEffect, useState, useRef } from "react";

const InfoCard = ({ onClose, results, points, formatDistance }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Drag start
  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    offset.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  // While dragging
  const onDrag = (e) => {
    if (!dragging) return;
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    setPosition({
      x: clientX - offset.current.x,
      y: clientY - offset.current.y,
    });
  };

  // Stop drag
  const endDrag = () => setDragging(false);

  // Close with fade
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
      <div
        className={`backdrop-blur-md shadow-lg rounded-xl border p-3 
        transition-colors duration-500 ease-in-out
        bg-white/70 dark:bg-gray-900/70 
        border-gray-200 dark:border-gray-700
        text-gray-800 dark:text-gray-100`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3 select-none">
          <h2 className="text-lg font-semibold flex items-center gap-1">
            📊 Results
          </h2>
          {onClose && (
            <button
              onClick={handleClose}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-red-500 transition cursor-pointer"
              aria-label="Close info card"
            >
              ❌
            </button>
          )}
        </div>

        {/* Body */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Location Count:</span>{" "}
            {points.length || 0}
          </p>
          <p>
            <span className="font-medium">Total Distance:</span>{" "}
            {(results && `${formatDistance(results.totalDistance)}`) || "0 km"}
          </p>
          <p>
            <span className="font-medium">Closest Pair:</span>{" "}
            {(results && `${formatDistance(results.minDist)} apart`) || "none"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
