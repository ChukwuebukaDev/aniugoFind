import { useUiStore } from "../Zustand/uiState";
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
        />
      )}
    </>
  );
}
