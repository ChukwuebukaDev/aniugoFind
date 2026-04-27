import "leaflet/dist/leaflet.css";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import { useUiStore } from "../Zustand/uiState";
import { useEffect } from "react";
import { Toaster } from "sonner";

function App() {
  const { loading, setLoading } = useUiStore();
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [setLoading]);
  return (
    <div className="relative w-full min-h-screen flex flex-col dark:text-gray-100 transition-colors duration-500 ease-in-out">
      <Spinner loading={loading} />
      <Header />

      <Main />

      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
