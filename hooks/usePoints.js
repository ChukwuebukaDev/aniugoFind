import { useState, useEffect } from "react";

export default function usePoints() {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem("aniugo_points");
    return saved ? JSON.parse(saved) : [];
  });

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPoint = {
            lat: latitude,
            lng: longitude,
            name: "Starting point",
            isUser: true,
          };

          setUserLocation(userPoint);

          // Ensure user location is first
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
          timeout: 15000,
        }
      );
    }
  }, []);

  // Sync points with localStorage
  useEffect(() => {
    localStorage.setItem("aniugo_points", JSON.stringify(points));
  }, [points]);

  const addPoint = (lat, lng) => {
    setPoints((prev) => {
      const exists = prev.some((p) => p.lat === lat && p.lng === lng);
      if (exists) return prev;
      return [...prev, { lat, lng }];
    });
  };

  const removePoint = (index) => {
    setPoints((prev) => {
      const filtered = prev.filter((_, i) => i !== index && !prev[i].isUser);
      const user = prev.find((p) => p.isUser);
      return user ? [user, ...filtered] : filtered;
    });
  };

  const clearPoints = () => {
    setPoints((prev) => {
      const user = prev.find((p) => p.isUser);
      return user ? [user] : [];
    });
  };

  const setAllPoints = (newPoints) => {
    setPoints((prev) => {
      const user = prev.find((p) => p.isUser);
      const filtered = newPoints.filter((p) => !p.isUser);
      return user ? [user, ...filtered] : filtered;
    });
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
