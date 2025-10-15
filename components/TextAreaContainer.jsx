import { useState } from "react";
import CalculateAndClearBtn from "./TextBtn";
import TextInputBtn from "../appBtnHandlers/TextInputBtn";
const TextArea = ({
  input,
  setInput,
  points,
  setPoints,
  calculateResults,
  clearAll,
}) => {
  const [showInput, setShowInput] = useState(false); // 👈 new toggle state
  return (
    <>
      <TextInputBtn
        input={input}
        showInput={showInput}
        setShowInput={setShowInput}
        setPoints={setPoints}
      />

      {/* Collapsible TextArea with smooth transition */}
      <div
        className={`transition-all duration-900 text-amber-50  ${
          showInput
            ? "max-h-[500px] w-full absolute bg-black/75 opacity-100 topper"
            : "max-h-0 opacity-0"
        }`}
      >
        <h2>🗺️ Coordinate Map with Distance Matrix</h2>
        <p>
          Click the map or input coordinates manually (format: lat, lng, name)
        </p>
        <textarea
          className="w-full p-2.5 mb-2.5 outline-0 border-1"
          rows="6"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: 6.5244, 3.3792, Lagos"
        />

        {/* Calculate and Clear buttons */}
        <CalculateAndClearBtn
          input={input}
          points={points}
          setPoints={setPoints}
          setShowInput={setShowInput}
          calculateResults={calculateResults}
          clearAll={clearAll}
        />
      </div>
    </>
  );
};
export default TextArea;
