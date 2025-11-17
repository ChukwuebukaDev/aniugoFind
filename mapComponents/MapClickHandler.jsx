import { useMapEvents } from "react-leaflet";
import { useState, useEffect, useCallback, useRef } from "react";

import ClipLoader from "react-spinners/ClipLoader";
import ErrorDisplay from "../utilities/Notifications/ErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";

function MapClickHandler({ setPoints }) {
  const [locationReady, setLocationReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const maxAttempts = 3;
  const currentLocationRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔁 Core logic for fetching + retrying location
  const startLocationProcess = useCallback(() => {
    setAttempts(0);
    setError(false);
    setLocationReady(false);

    const tryFetchLocation = async () => {
      try {
        const location = await getCurrentLocation();

        if (location && Array.isArray(location)) {
          clearInterval(intervalRef.current);

          const firstPoint = {
            lat: location[0],
            lng: location[1],
            name: "Starting Point",
          };

          currentLocationRef.current = firstPoint;
          setPoints([firstPoint]);
          setLocationReady(true);
        } else {
          throw new Error("Location unavailable");
        }
      } catch {
        console.warn("⚠️ Location fetch failed, will retry...");
      }
    };

    // Immediate first attempt
    tryFetchLocation();

    // Retry every 5 seconds
    intervalRef.current = setInterval(() => {
      setAttempts((prev) => {
        if (prev + 1 >= maxAttempts) {
          clearInterval(intervalRef.current);
          setError(true);
          console.warn("⚠️ Max location attempts reached");
          return prev + 1;
        }
        tryFetchLocation();
        return prev + 1;
      });
    }, 5000);
  }, [maxAttempts, setPoints]);

  // Run once on mount
  useEffect(() => {
    startLocationProcess();
    return () => clearInterval(intervalRef.current);
  }, [startLocationProcess]);

  // 🗺️ Handle map clicks
  useMapEvents({
    click(e) {
      const tag = e.originalEvent?.target?.tagName?.toLowerCase();
      if (["button", "svg", "path"].includes(tag)) return;
      if (!locationReady) {
        console.log("⏳ Location not ready yet — click ignored");
        return;
      }

      const clickedPoint = e.latlng;

      setPoints((prevPoints) => {
        const updated = [...prevPoints];
        if (updated.length === 0) {
          updated.push(currentLocationRef.current);
        } else {
          updated[0] = currentLocationRef.current;
        }
        updated.push(clickedPoint);
        return updated;
      });
    },
  });

  return (
    <AnimatePresence>
      {!locationReady && (
        <motion.div
          className="absolute inset-0 bg-black/60 flex justify-center items-center flex-col topper z-[999]"
          key="spinnerOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {!error ? (
            <>
              <ClipLoader color="#ffffff" size={60} speedMultiplier={1.2} />
              <p className="mt-2.5 text-white text-xs font-semibold">
                Getting your location (Attempt {attempts + 1}/{maxAttempts})...
              </p>
            </>
          ) : (
            <ErrorDisplay
              message="Unable to fetch location. Please check your GPS or permissions."
              actionText="Retry"
              onAction={startLocationProcess}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MapClickHandler;
