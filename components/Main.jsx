import CoordinateMap from "../mapComponents/Map";
import ControlPanel from "./ControlPanel";
export default function Main() {
  const handleSearch = (query) => {
    console.log("Searching for:", query);
    // later, we’ll plug in your find-location logic here
  };

  return (
    <main className="flex-1">
      <CoordinateMap />
    </main>
  );
}
