import { useState, useEffect } from "react";

export default function usePoints() {
  const [points, setPoints] = useState(() => {
    try {
      const saved = localStorage.getItem("aniugo_points");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn("Invalid saved points:", err);
      return [];
    }
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
        },
        (err) => console.warn("Error getting user location:", err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }
  }, []);

  // Always keep user point at the top
  useEffect(() => {
    if (userLocation) {
      setPoints((prev) => {
        const others = prev.filter((p) => !p.isUser);
        return [userLocation, ...others];
      });
    }
  }, [userLocation]);

  // Persist points
  useEffect(() => {
    localStorage.setItem("aniugo_points", JSON.stringify(points));
  }, [points]);

  const addPoint = (lat, lng) => {
    if (isNaN(lat) || isNaN(lng)) return;
    setPoints((prev) => {
      const exists = prev.some((p) => p.lat === lat && p.lng === lng);
      if (exists) return prev;
      return [...prev, { lat, lng }];
    });
  };

  const removePoint = (index) => {
    setPoints((prev) => {
      const filtered = prev.filter((p, i) => i !== index && !p.isUser);
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
    const validPoints = newPoints.filter(
      (p) =>
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        !isNaN(p.lat) &&
        !isNaN(p.lng)
    );
    setPoints((prev) => {
      const user = prev.find((p) => p.isUser);
      const filtered = validPoints.filter((p) => !p.isUser);
      return user ? [user, ...filtered] : filtered;
    });
  };

  const refreshUserLocation = () => {
    if (!navigator.geolocation) return;
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
      },
      (err) => console.warn("Error refreshing location:", err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return {
    points,
    userLocation,
    addPoint,
    removePoint,
    clearPoints,
    setAllPoints,
    refreshUserLocation,
  };
}
