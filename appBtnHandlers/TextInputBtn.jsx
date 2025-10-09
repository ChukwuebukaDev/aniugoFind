export default function TextInputBtn({ showInput, setShowInput }) {
  return (
    <div className="flex justify-end">
      {/* Toggle Button */}

      <span
        onClick={() => setShowInput((prev) => !prev)}
        className="fixed top-30 right-2 z-[1100] rounded-md text-xs font-bold cursor-pointer shadow-md transition"
      >
        {showInput ? "Hide Bar" : "click here to enter coords"}
      </span>
    </div>
  );
}
