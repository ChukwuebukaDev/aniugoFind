import { useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { getCurrentLocation } from "../otherScripts.js/getLocation";
import ClipLoader from "react-spinners/ClipLoader"; // 🌀 Spinner
import { motion, AnimatePresence } from "framer-motion"; // ✨ Animation
import { filterSiteId } from "../utilities/siteIdFiltering";

function MapClickHandler({ handleMapClick, setPoints }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationReady, setLocationReady] = useState(false);

  // ✅ Fetch current location once when the component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getCurrentLocation();
      if (!location) return;

      const firstPoint = {
        lat: location[0],
        lng: location[1],
        name: "Starting Point",
      };
      setCurrentLocation(firstPoint);
      setPoints([firstPoint]);
      setLocationReady(true); // ✅ show fade-out
    };

    fetchLocation();
  }, [setPoints]);

  // ✅ Listen for map clicks (only when ready)
  useMapEvents({
    click(e) {
      // Ignore clicks originating from DOM elements with the button class
      const tagName = e.originalEvent?.target?.tagName?.toLowerCase();
      if (tagName === "button" || tagName === "svg" || tagName === "path")
        return;
      if (!locationReady) {
        console.log("⏳ Location not ready yet — click ignored");
        return;
      }

      const clickedPoint = e.latlng;
      handleMapClick(); // toggle infoCard

      setPoints((prevPoints) => {
        const updatedPoints = [...prevPoints];
        if (updatedPoints.length === 0) {
          updatedPoints.push(currentLocation);
        } else {
          updatedPoints[0] = currentLocation;
        }
        updatedPoints.push(clickedPoint);
        return updatedPoints;
      });
    },
  });

  // ✅ Animated overlay using AnimatePresence + motion.div
  return (
    <>
      <AnimatePresence>
        {!locationReady && (
          <motion.div
            className="absolute inset-0 bg-black/60 flex justify-center items-center flex-col topper"
            key="spinnerOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ClipLoader color="#ffffff" size={60} speedMultiplier={1.2} />
            <p className="mt-2.5 text-white text-xs font-semibold">
              Getting your location...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MapClickHandler;
