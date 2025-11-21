import { useUiStore } from "../Zustand/uiState";
export default function BackgroundEvents() {
  const {
    showInput,
    toggleShowInput,
    autoCluster,
    isSidebarOpen,
    showImporter,
    toggleAutoCluster,
    toggleShowImporter,
    toggleSidebar,
    closePoints,
    toggleClosePoints,
  } = useUiStore();
  const state =
    showInput || autoCluster || showImporter || closePoints || isSidebarOpen;
  function toggleBackgroundEvents() {
    if (showInput) toggleShowInput();
    if (autoCluster) toggleAutoCluster();
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
        />
      )}
    </>
  );
}
