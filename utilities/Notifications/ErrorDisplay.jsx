export default function ErrorDisplay({
  message,
  onAction, // optional: callback for retry or custom action
  onClose, // optional: callback for closing the dialog
}) {
  const ifMessage =
    message ??
    "(404) Requested data not found, click on Try Again or Close to exit";

  return (
    <div
      role="alertdialog"
      aria-labelledby="error-message"
      id="error-message"
      className="min-w-[20rem] max-w-sm bg-black/70 absolute top-1/2 left-1/2 rounded-2xl p-4 text-white font-bold flex flex-col -translate-x-1/2 -translate-y-1/2 shadow-xl animate-fadeIn"
    >
      <section className="mb-4">
        <span className="bg-green-300 text-black rounded-sm px-1.5 py-0.5">
          Error:
        </span>{" "}
        {ifMessage}
      </section>

      <section className="flex justify-center items-center gap-x-3.5">
        <button
          onClick={onAction || (() => location.reload())}
          className="cursor-pointer border py-1 px-3.5 rounded-sm hover:border-0 hover:bg-white/30 transition-all duration-300 hover:text-black"
        >
          Try Again
        </button>

        <button
          onClick={
            onClose ||
            (() => document.getElementById("error-message")?.remove())
          }
          className="cursor-pointer border px-3.5 py-1 rounded-sm hover:border-0 hover:bg-white/30 transition-all duration-300 hover:text-black"
        >
          Close
        </button>
      </section>
    </div>
  );
}
