import { useUiStore } from "../Zustand/uiState";
import { usePointsStore } from "../Zustand/MapStateManager";
export default function BackgroundEvents() {
  const {
    showInput,
    toggleShowInput,
    isSidebarOpen,
    showImporter,
    toggleShowImporter,
    toggleSidebar,
    closePoints,
    toggleClosePoints,
  } = useUiStore();
  const state = showInput || showImporter || closePoints || isSidebarOpen;
  const { points } = usePointsStore();
  function toggleBackgroundEvents() {
    if (showInput) toggleShowInput();
    if (isSidebarOpen) toggleSidebar();
    if (showImporter) toggleShowImporter();
    if (closePoints) toggleClosePoints();
  }
  return (
    <>
      {state && (
        <div
          onClick={toggleBackgroundEvents}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
        >
          <div className="h-full text-3xl font-bold flex justify-center items-center">
            {points.length <= 1 && "Point List Empty..."}
          </div>
        </div>
      )}
    </>
  );
}
