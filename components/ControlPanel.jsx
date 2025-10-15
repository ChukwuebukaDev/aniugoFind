export default function ControlPanel({ onSearch }) {
  return (
    <div className="absolute top-6 right-6 z-[1000] w-80 max-w-[90vw] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        Find a Location
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.elements.query.value.trim();
          if (input) onSearch?.(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          name="query"
          placeholder="Enter coordinates or place..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition"
        >
          Go
        </button>
      </form>
    </div>
  );
}
