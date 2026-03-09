import "leaflet/dist/leaflet.css";
import Spinner from "../components/Spinner";
import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";
import { useUiStore } from "../Zustand/uiState";
import { useState } from "react";
import SnakeGame from "../SnakeGame";
function App() {
  const { loading } = useUiStore();
const [open,setOpen] = useState(false);
  return (
    <div className="relative w-full min-h-screen flex flex-col dark:text-gray-100 transition-colors duration-500 ease-in-out">
         <button className="bg-black/70 font-bold text-white rounded-4xl z-[10000] p-2 fixed top-40" onClick={()=> setOpen(p => !p)}>{open ? 'close map' : 'open map'}</button>
      <Spinner loading={loading} />
      <Header />
       {open ?  <Main /> : <div className="flex-1 flex justify-center items-center"><SnakeGame/></div>}
      <Footer />
    </div>
  );
}

export default App;
