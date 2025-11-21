import { ClipLoader } from "react-spinners";

export default function Spinner({ loading }) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 text-white">
      <ClipLoader color="#ffffff" size={60} />
      <p className="mt-4 text-lg font-medium tracking-wide animate-pulse">
        Loading application...
      </p>
    </div>
  );
}
