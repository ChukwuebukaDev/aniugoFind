export default function ErrorDisplay({ message }) {
  const ifMessage =
    message ??
    "(404) Requested data not found,click on try again or close to exit";
  return (
    <div
      role="alertdialog"
      aria-labelledby="error-message"
      id="error-message."
      className="min-w-[20rem] max-w-sm bg-black/70 absolute top-1/2 topper left-1/2 rounded-2xl p-2 text-white font-bold flex flex-col -translate-x-1/2 -translate-y-1/2 shadow-xl animate-fadeIn"
    >
      <section>
        <span className="bg-green-300 text-black">Error: {ifMessage}</span>
      </section>

      <section className="flex-1 flex justify-center items-end gap-x-3.5">
        <button className="cursor-pointer border py-1 px-3.5 rounded-sm hover:border-0 hover:bg-white/30 transition-all duration-600 hover:text-black">
          Try again
        </button>
        <button className="cursor-pointer border px-3.5 py-1 rounded-sm hover:border-0 hover:bg-white/30 transition-all duration-600 hover:text-black">
          Close
        </button>
      </section>
    </div>
  );
}
