import { create } from "zustand";

export const useUiStore = create((set) => ({
  // ---------- STATE ----------
  isSidebarOpen: false,
  loading: true,
  input: "",
  results: null,
  closePoints: false,
  bouncingMarkers: [],
  popupTarget: null,
  offMap: false,
  showImporter: false,
  importLoading: false,
  showInput: false,
  autoCluster: false,
  // ---------- ACTIONS ----------
  setIsSidebarOpen: (val) => set({ isSidebarOpen: val }),
  setLoading: (val) => set({ loading: val }),
  setClosePoints: (val) => set({ closePoints: val }),
  setShowInput: (val) => set({ showInput: val }),
  setInput: (val) => set({ input: val }),
  setResults: (val) => set({ results: val }),
  setBouncingMarkers: (arr) => set({ bouncingMarkers: arr }),
  setPopupTarget: (val) => set({ popupTarget: val }),
  setOffMap: (val) => set({ offMap: val }),
  setShowImporter: (val) => set({ showImporter: val }),
  setImportLoading: (val) => set({ importLoading: val }),
  setAutoCluster: (val) => set({ autoCluster: val }),

  // ---------- TOGGLE ACTIONS ----------
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleClosePoints: () =>
    set((state) => ({ closePoints: !state.closePoints })),
  toggleAutoCluster: () =>
    set((state) => ({ autoCluster: !state.autoCluster })),
  toggleShowImporter: () =>
    set((state) => ({ showImporter: !state.showImporter })),
  toggleShowInput: () => set((state) => ({ showInput: !state.showInput })),
}));
