export default function ClosestPointToast({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-xl shadow-lg animate-fadeIn">
      {message}
    </div>
  );
}
