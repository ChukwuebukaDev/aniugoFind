import { useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { getCurrentLocation } from "../otherScripts.js/getLocation";
import ClipLoader from "react-spinners/ClipLoader"; // 🌀 Spinner
import { motion, AnimatePresence } from "framer-motion"; // ✨ Animation

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
      console.log("Current location set:", firstPoint);
    };

    fetchLocation();
  }, [setPoints]);

  // ✅ Listen for map clicks (only when ready)
  useMapEvents({
    click(e) {
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

      console.log("Clicked:", clickedPoint);
    },
  });

  // ✅ Animated overlay using AnimatePresence + motion.div
  return (
    <>
      <AnimatePresence>
        {!locationReady && (
          <motion.div
            key="spinnerOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              zIndex: 1000,
            }}
          >
            <ClipLoader color="#ffffff" size={60} speedMultiplier={1.2} />
            <p
              style={{
                marginTop: "10px",
                color: "#fff",
                fontSize: "1.1rem",
                fontWeight: "500",
              }}
            >
              Getting your location...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MapClickHandler;
