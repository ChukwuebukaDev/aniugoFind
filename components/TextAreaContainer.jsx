import { useState, useEffect } from "react";
import extraPointBarToggler from "../utilities/helperHook";
import AddExtraPoints from "./AddExtraPoints";
import CalculateAndClearBtn from "./TextBtn";
import TextInputBtn from "../appBtnHandlers/TextInputBtn";
import useDarkMode from "../Themes/useDarkMode";

const TextArea = ({
  input,
  setInput,
  points,
  setPoints,
  calculateResults,
  clearAll,
  setVisible, // 👈 new prop from parent
}) => {
  const { showBar } = extraPointBarToggler();
  const [showInput, setShowInput] = useState(false);
  const [theme] = useDarkMode();

  useEffect(() => {
    setVisible(showInput);
  }, [showInput, setVisible]);

  // 🎨 Define theme-based styles
  const isDark = theme === "dark";
  const containerBase =
    "transition-all duration-700 ease-in-out font-semibold z-[9999] rounded-2xl absolute top-[15%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[70%] max-w-2xl shadow-lg border backdrop-blur-md";
  const activeContainer = showInput
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 -translate-y-6 pointer-events-none";

  const darkStyles = "bg-white/10 text-white border-white/20";
  const lightStyles = "bg-black/5 text-gray-900 border-gray-300";

  return (
    <>
      {/* 🔹 Toggle for adding extra points */}
      {showBar && <AddExtraPoints setPoints={setPoints} />}

      {/* 🔹 Floating toggle button */}
      <TextInputBtn
        input={input}
        showInput={showInput}
        setShowInput={setShowInput}
        setPoints={setPoints}
      />

      {/* 🔹 Animated, theme-aware TextArea Container */}
      <div
        className={`${containerBase} ${activeContainer} ${
          isDark ? darkStyles : lightStyles
        } p-4`}
      >
        <p
          className={`text-sm mb-3 tracking-wide ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          📍 Enter coordinates manually or click on the map (format:{" "}
          <span
            className={`font-medium ${
              isDark ? "text-amber-300" : "text-amber-600"
            }`}
          >
            lat, lng, name
          </span>
          )
        </p>

        <textarea
          className={`w-full rounded-xl p-3 text-sm resize-none focus:ring-2 focus:outline-none transition-all duration-300 ${
            isDark
              ? "bg-black/40 border border-white/20 text-gray-100 placeholder-gray-400 focus:ring-amber-400"
              : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-amber-500"
          }`}
          rows="6"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: 6.5244, 3.3792, Lagos"
        />

        {/* 🔹 Action Buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <CalculateAndClearBtn
            input={input}
            points={points}
            setPoints={setPoints}
            setShowInput={setShowInput}
            calculateResults={calculateResults}
            clearAll={clearAll}
          />
        </div>
      </div>
    </>
  );
};

export default TextArea;
