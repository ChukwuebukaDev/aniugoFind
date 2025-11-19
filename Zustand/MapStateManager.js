import { create } from "zustand";

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

export const usePointsStore = create((set, get) => ({
  // ---------- STATE ----------
  points: loadSavedPoints(),
  userLocation: null,

  // ---------- INTERNAL UTILS ----------
  _persist() {
    const { points } = get();
    localStorage.setItem("aniugo_points", JSON.stringify(points));
  },

  _injectUserPoint(newPoints) {
    const user = get().userLocation;
    if (!user) return newPoints;
    const filtered = newPoints.filter((p) => !p.isUser);
    return [user, ...filtered];
  },

  // ---------- ACTIONS ----------
  setUserLocation(location) {
    set({ userLocation: location });

    // Update points to place user at index 0
    const { points, _injectUserPoint, _persist } = get();
    const reordered = _injectUserPoint(points);
    set({ points: reordered });

    _persist();
  },

  addPoint(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) return;

    const { points, _injectUserPoint, _persist } = get();

    const exists = points.some((p) => p.lat === lat && p.lng === lng);
    if (exists) return;

    const newPoints = [...points, { lat, lng }];
    set({ points: _injectUserPoint(newPoints) });

    _persist();
  },

  removePoint(index) {
    const { points, _injectUserPoint, _persist } = get();

    const filtered = points.filter((p, i) => i !== index && !p.isUser);
    const reordered = _injectUserPoint(filtered);

    set({ points: reordered });
    _persist();
  },

  clearPoints() {
    const { userLocation, _persist } = get();
    set({ points: userLocation ? [userLocation] : [] });

    _persist();
  },

  setAllPoints(newPoints) {
    const { _injectUserPoint, _persist } = get();

    const valid = newPoints.filter(
      (p) =>
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        !isNaN(p.lat) &&
        !isNaN(p.lng)
    );

    set({ points: _injectUserPoint(valid) });
    _persist();
  },

  refreshUserLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const user = {
          lat: latitude,
          lng: longitude,
          name: "Starting point",
          isUser: true,
        };

        get().setUserLocation(user);
      },
      (err) => console.warn("Error refreshing location:", err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  },
}));

// ----- Auto-run user location on first import -----
navigator.geolocation?.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    usePointsStore.getState().setUserLocation({
      lat: latitude,
      lng: longitude,
      name: "Starting point",
      isUser: true,
    });
  },
  (err) => console.warn("Error getting user location:", err),
  { enableHighAccuracy: true, timeout: 15000 }
);
