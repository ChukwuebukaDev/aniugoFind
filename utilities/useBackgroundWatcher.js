import { useEffect, useState, useRef } from "react";
import { usePointsStore } from "../Zustand/MapStateManager";
import { findClosestToStartRoad } from "./closestPairsCalculation";

export function useAniugoBackgroundWatcher() {
  const { points } = usePointsStore();
  const [closestPoint, setClosestPoint] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "" });

  const lastPointRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const checkLocation = async () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          if (!points?.length) return;

          const closestData = await findClosestToStartRoad(points, {
            currentLocation: { lat: latitude, lng: longitude },
          });

          const newPoint = closestData?.pair?.[closestData.pair.length - 1];

          if (!newPoint) return;

          setClosestPoint(newPoint);

          // ✅ Only fire when closest point actually changes
          if (
            !lastPointRef.current ||
            lastPointRef.current.name !== newPoint.name
          ) {
            lastPointRef.current = newPoint;

            // ✅ Trigger vibration (safe + subtle)
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            setToast({
              show: true,
              message: `Closest location updated: ${newPoint.name}`,
            });

            setTimeout(() => {
              setToast({ show: false, message: "" });
            }, 3000);
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    };

    checkLocation();
    const interval = setInterval(checkLocation, 60000);

    return () => clearInterval(interval);
  }, [points]);

  return { closestPoint, toast };
}
