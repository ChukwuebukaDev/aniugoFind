import "leaflet/dist/leaflet.css";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import { useUiStore } from "../Zustand/uiState";

function App() {
  const { loading } = useUiStore();

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500 ease-in-out">
      <Spinner loading={loading} />
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default App;
