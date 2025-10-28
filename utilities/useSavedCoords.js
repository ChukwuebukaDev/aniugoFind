import { useState, useEffect } from "react";
import {
  getSavedCoordinateSets,
  saveCoordinateSet,
  deleteCoordinateSet,
  clearAllSavedSets,
} from "./savedCoordinates";

// ✅ Custom hook for managing saved coordinates in React
export const useSavedCoordinates = () => {
  const [savedSets, setSavedSets] = useState(getSavedCoordinateSets());

  // Keep state in sync with localStorage changes
  useEffect(() => {
    const syncStorage = () => setSavedSets(getSavedCoordinateSets());
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  const addSet = (name, coordinates) => {
    const newSet = saveCoordinateSet(name, coordinates);
    if (newSet) setSavedSets((prev) => [...prev, newSet]);
  };

  const removeSet = (id) => {
    deleteCoordinateSet(id);
    setSavedSets(getSavedCoordinateSets());
  };

  const clearAll = () => {
    clearAllSavedSets();
    setSavedSets([]);
  };

  return { savedSets, addSet, removeSet, clearAll };
};
