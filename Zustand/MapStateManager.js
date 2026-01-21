import { create } from "zustand";

/* ---------------------------------------------
   Utilities
--------------------------------------------- */

// Safe ID generator
const generateId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

// Load saved points safely
const loadSavedPoints = () => {
  try {
    const saved = localStorage.getItem("aniugo_points");
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.warn("Invalid saved points:", err);
    return [];
  }
};

// Normalize every point (guarantees arrival + id + optional siteId)
const normalizePoint = (point, overrides = {}) => ({
  id: point.id ?? generateId(),
  lat: point.lat,
  lng: point.lng,
  name: point.name,
  siteId: point.siteId ?? null, // ✅ REQUIRED FOR EXCEL MATCHING
  isUser: !!point.isUser,
  arrival: point.isUser ? "arrived" : "pending",
  ...overrides,
});

/* ---------------------------------------------
   Store
--------------------------------------------- */

export const usePointsStore = create((set, get) => ({
  // ---------- STATE ----------
  points: loadSavedPoints(),
  userLocation: null,

  // ---------- INTERNAL ----------
  _persist() {
    localStorage.setItem("aniugo_points", JSON.stringify(get().points));
  },

  _injectUserPoint(points) {
    const user = get().userLocation;
    if (!user) return points;

    const normalizedUser = normalizePoint(user, {
      isUser: true,
      arrival: "arrived",
    });

    return [normalizedUser, ...points.filter((p) => !p.isUser)];
  },

  // ---------- ACTIONS ----------
  setUserLocation(location) {
    const normalized = normalizePoint(location, {
      isUser: true,
      arrival: "arrived",
    });

    set({ userLocation: normalized });

    set((state) => ({
      points: state._injectUserPoint(state.points),
    }));

    get()._persist();
  },

  addPoint(lat, lng, name, siteId = null) {
    if (isNaN(lat) || isNaN(lng)) return;

    set((state) => {
      const exists = state.points.some((p) => p.lat === lat && p.lng === lng);
      if (exists) return state;

      const point = normalizePoint({ lat, lng, name, siteId });

      return {
        points: state._injectUserPoint([...state.points, point]),
      };
    });

    get()._persist();
  },

  removePoint(id) {
    set((state) => ({
      points: state._injectUserPoint(
        state.points.filter((p) => p.id !== id && !p.isUser),
      ),
    }));

    get()._persist();
  },

  clearPoints() {
    const user = get().userLocation;
    set({ points: user ? [user] : [] });
    get()._persist();
  },

  setAllPoints(newPoints) {
    const normalized = newPoints
      .filter(
        (p) =>
          typeof p.lat === "number" &&
          typeof p.lng === "number" &&
          !isNaN(p.lat) &&
          !isNaN(p.lng),
      )
      .map((p) => normalizePoint(p));

    set((state) => ({
      points: state._injectUserPoint(normalized),
    }));

    get()._persist();
  },

  // ---------- ARRIVAL ----------
  markArrived(id) {
    set((state) => ({
      points: state.points.map((p) =>
        p.id === id && !p.isUser ? { ...p, arrival: "arrived" } : p,
      ),
    }));

    get()._persist();
  },

  markPending(id) {
    set((state) => ({
      points: state.points.map((p) =>
        p.id === id && !p.isUser ? { ...p, arrival: "pending" } : p,
      ),
    }));

    get()._persist();
  },

  markAllArrived() {
    set((state) => ({
      points: state.points.map((p) =>
        p.isUser ? p : { ...p, arrival: "arrived" },
      ),
    }));

    get()._persist();
  },

  // ---------- GEO ----------
  refreshUserLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        get().setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Starting point",
          isUser: true,
        });
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  },
}));

/* ---------------------------------------------
   Auto-run user location (unchanged behavior)
--------------------------------------------- */

navigator.geolocation?.getCurrentPosition(
  (pos) => {
    usePointsStore.getState().setUserLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      name: "Starting point",
      isUser: true,
    });
  },
  (err) => console.warn("Error getting user location:", err),
  { enableHighAccuracy: true, timeout: 15000 },
);
