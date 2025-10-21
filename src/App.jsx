import "leaflet/dist/leaflet.css";
import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import ErrorDisplay from "../utilities/Notifications/ErrorDisplay";
function App() {
  return (
    <>
      <ErrorDisplay />
      <Header />
      <Main />
      <Footer />
    </>
  );
}

export default App;
