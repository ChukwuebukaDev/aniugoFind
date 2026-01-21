import CoordinateMap from "../mapComponents/Map";
import { MapControls } from "../appBtnHandlers/MapControls";
import BackgroundEvents from "./BackgroundEvents";
import ExcelCompareImporter from "../lib/RefExtractor";
import ClearAllPointsButton from "../appBtnHandlers/ClearAlllPoints";
export default function Main() {
  return (
    <main className="relative flex-1">
      <CoordinateMap />
      <MapControls />
      <BackgroundEvents />
      <ExcelCompareImporter />
      <ClearAllPointsButton />
    </main>
  );
}
