import { create } from "zustand";

const extraPointBarToggler = create((set) => ({
  showBar: false,
  toggleShowbar: () => set((state) => ({ showBar: !state.showBar })),
  setShowBar: (value) => set({ showBar: value }),
}));

export default extraPointBarToggler;
