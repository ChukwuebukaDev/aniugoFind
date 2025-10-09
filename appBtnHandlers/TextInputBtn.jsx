import React from "react";

export default function TextInputBtn({ showInput, setShowInput }) {
  return (
    <div className="flex justify-end">
      {/* Toggle Button */}

      <button
        onClick={() => setShowInput((prev) => !prev)}
        className="fixed top-25 right-2 z-[1100] p-6 rounded-md bg-green-700 text-white font-bold hover:bg-green-600 cursor-pointer shadow-md transition preset-btn"
      >
        {showInput ? "Hide Bar" : "Enter Coordinates"}
      </button>
    </div>
  );
}
