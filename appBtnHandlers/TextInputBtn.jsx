export default function TextInputBtn({ showInput, setShowInput }) {
  return (
    <div className="flex">
      {/* Toggle Button */}

      <button
        onClick={(e) => {
          e.preventDefault();
          setShowInput((prev) => !prev);
        }}
        className="fixed top-1/2 ml-1.5 bg-black/30 text-shadow-white border p-1.5 z-[1100] rounded-md text-xs font-bold cursor-pointer shadow-md transition"
      >
        {showInput ? "Hide Bar" : "enter coords"}
      </button>
    </div>
  );
}
