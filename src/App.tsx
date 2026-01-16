import "leaflet/dist/leaflet.css";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import { useUiStore } from "../Zustand/uiState";
import ExcelSiteImporter from "../components/RefExtractor";
function App() {
  const { loading } = useUiStore();

  return (
    <div className="relative w-full min-h-screen flex flex-col dark:text-gray-100 transition-colors duration-500 ease-in-out">
      <Spinner loading={loading} />
      <Header />
      <Main />
      {/* <ExcelSiteImporter /> */}
      <Footer />
    </div>
  );
}

export default App;
