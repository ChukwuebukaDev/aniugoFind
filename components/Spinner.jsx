import { ClipLoader } from "react-spinners";

export default function Spinner({ loading }) {
  return (
    loading && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <ClipLoader color="#ffffff" size={60} />
      </div>
    )
  );
}
