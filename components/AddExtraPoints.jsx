import { useState } from "react";

export default function AddExtraPoints({ showInput, setPoints }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleExtraPoints = (e) => {
    e.preventDefault();

    const [latStr, lngStr] = inputValue.split(",").map((v) => v.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (!isNaN(lat) && !isNaN(lng)) {
      setPoints((prev) => [...prev, { lat, lng }]);
      console.log("✅ Added point:", { lat, lng });
      setInputValue("");
      setError("");
    } else {
      setError("⚠️ Please enter valid coordinates in 'lat,lng' format.");
      console.log("❌ Invalid input. Expected format: lat,lng");
    }
  };

  return (
    <form
      className={`transition-all flex justify-center items-center duration-900 text-amber-50  ${
        !showInput
          ? "max-h-[200px] w-full absolute opacity-100 topper"
          : "max-h-0 opacity-0"
      }`}
      onSubmit={handleExtraPoints}
    >
      <input
        id="extraPoints"
        className="border-dashed border-2 rounded-xl ml-1.5 px-2 bg-black/40 mt-1"
        type="text"
        placeholder="e.g. 6.45, 3.39"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
    </form>
  );
}
