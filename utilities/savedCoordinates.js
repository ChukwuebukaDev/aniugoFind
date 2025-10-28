const STORAGE_KEY = "aniugoFind_savedCoordinates";

//  Get all saved coordinate sets
export const getSavedCoordinateSets = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading saved coordinate sets:", error);
    return [];
  }
};

// Save a new coordinate set
export const saveCoordinateSet = (name, coordinates) => {
  const sets = getSavedCoordinateSets();
  const newSet = {
    id: Date.now().toString(),
    name,
    coordinates,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...sets, newSet]));
    return newSet;
  } catch (error) {
    console.error("Error saving coordinate set:", error);
    return null;
  }
};

//  Delete a specific saved set
export const deleteCoordinateSet = (id) => {
  try {
    const sets = getSavedCoordinateSets().filter((set) => set.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (error) {
    console.error("Error deleting coordinate set:", error);
  }
};

//  Clear all saved sets
export const clearAllSavedSets = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing saved coordinate sets:", error);
  }
};
