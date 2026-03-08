import { useUiStore } from "../Zustand/uiState";
import { usePointsStore } from "../Zustand/MapStateManager";
export default function BackgroundEvents() {
  const {
    showInput,
    isSidebarOpen,
    showImporter,
    closePoints,
    autoCluster,
     activeControl,
    toggleControl,
  } = useUiStore();
  const state = showInput || showImporter || closePoints || isSidebarOpen;
  const { points } = usePointsStore();
  function toggleBackgroundEvents() {
    if (showInput){
      toggleControl('input');
      activeControl === 'input';
    };
    if (isSidebarOpen){
toggleControl('sidebar');
activeControl === 'sidebar';
    };
    if (showImporter) {
toggleControl('importer');
activeControl === 'importer';
    };
    if (closePoints) {
toggleControl('points');
activeControl === 'points';
    };
    if (autoCluster) {
toggleControl('cluster');
activeControl === 'cluster';
    };
  }
  return (
    <>
      {state && (
        <div
          onClick={toggleBackgroundEvents}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
        >
          <div className="h-full text-2xl font-bold flex justify-center items-center">
            {points.length <= 1 && "Point List Empty..."}
          </div>
        </div>
      )}
    </>
  );
}
