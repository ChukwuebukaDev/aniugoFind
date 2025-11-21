import CoordinateMap from "../mapComponents/Map";
import { MapControls } from "../appBtnHandlers/MapControls";
import BackgroundEvents from "./BackgroundEvents";
export default function Main() {
  return (
    <main className="relative flex-1">
      <CoordinateMap />
      <MapControls />
      <BackgroundEvents />
    </main>
  );
}
