import { useState, useEffect } from "react";

export default function usePoints() {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("aniugo_points");
    return saved ? JSON.parse(saved) : [];
  });

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPoint = {
            lat: latitude,
            name: "Starting point",
            lng: longitude,
            isUser: true,
          };
          setUserLocation(userPoint);

          // Ensure user location is first in points and stays updated
          setPoints((prev) => {
            const others = prev.filter((p) => !p.isUser);
            return [userPoint, ...others];
          });
        },
        (err) => {
          console.warn("Error getting user location:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // reuse location for up to 10s
          timeout: 15000,
        }
      );
    }

    // Cleanup watcher when unmounted
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Sync points with localStorage
  useEffect(() => {
    localStorage.setItem("aniugo_points", JSON.stringify(points));
  }, [points]);

  // Add a new coordinate (never duplicates user location)
  const addPoint = (lat, lng) => {
    setPoints((prev) => [...prev, { lat, lng }]);
  };

  // Remove coordinate (user location can’t be removed)
  const removePoint = (index) => {
    setPoints((prev) => {
      const filtered = prev.filter((_, i) => i !== index && !prev[i].isUser);
      if (userLocation) {
        return [userLocation, ...filtered];
      }
      return filtered;
    });
  };

  // Clear all except user location
  const clearPoints = () => {
    if (userLocation) {
      setPoints([userLocation]);
    } else {
      setPoints([]);
    }
  };

  // Replace all points (ensure user location stays first)
  const setAllPoints = (newPoints) => {
    if (userLocation) {
      const filtered = newPoints.filter((p) => !p.isUser);
      setPoints([userLocation, ...filtered]);
    } else {
      setPoints(newPoints);
    }
  };

  return {
    points,
    userLocation,
    addPoint,
    removePoint,
    clearPoints,
    setAllPoints,
  };
}
