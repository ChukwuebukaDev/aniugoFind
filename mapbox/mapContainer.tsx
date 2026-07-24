"use client";
import mapboxgl, { GeolocateControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0], // temporary center
      zoom: 2,
    });

    mapRef.current = map;

    // Disable interactions (optional)
    // map.dragPan.disable();
    // map.scrollZoom.disable();
    // map.boxZoom.disable();
    // map.dragRotate.disable();
    // map.keyboard.disable();
    // map.doubleClickZoom.disable();
    // map.touchZoomRotate.disable();

    // Geolocate control (optional UI button)
    map.addControl(
      new GeolocateControl({
        trackUserLocation: true,
        showAccuracyCircle: true,
      })
    );

    map.on("load", () => {
      if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        return;
      }

      // Watch position (live updates)
      navigator.geolocation.watchPosition(
        (position) => {
          const lng = position.coords.longitude;
          const lat = position.coords.latitude;

          // Move map to user
          map.flyTo({
            center: [lng, lat],
            zoom: 14,
          });

          // Create or update marker
          if (!markerRef.current) {
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              "<p>Car is here📍</p>"
            );

            markerRef.current = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map);

            markerRef.current.togglePopup();
          } else {
            markerRef.current.setLngLat([lng, lat]);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-2xl shadow-lg"
    />
  );
}