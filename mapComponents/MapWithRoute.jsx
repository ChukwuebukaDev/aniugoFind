import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";

// Sample marker icon fix for React-Leaflet
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
});

const MapWithRoute = ({ coordinates }) => {
  // Example: coordinates = [{ lat: 6.5244, lng: 3.3792 }, { lat: 7.3775, lng: 3.9470 }]
  const routeCoords = coordinates.map((c) => [c.lat, c.lng]);

  return (
    <MapContainer
      center={routeCoords.length ? routeCoords[0] : [0, 0]}
      zoom={6}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* Markers */}
      {coordinates.map((coord, idx) => (
        <Marker key={idx} position={[coord.lat, coord.lng]}>
          <Popup>
            <b>Point {idx + 1}</b> <br />
            Lat: {coord.lat.toFixed(4)}, Lng: {coord.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}

      {/* Route Line (Google-style) */}
      {routeCoords.length > 1 && (
        <>
          {/* White outline */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "white",
              weight: 8,
              opacity: 1,
            }}
          />
          {/* Blue overlay */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#1E90FF", // Google blue
              weight: 5,
              opacity: 0.9,
            }}
            smoothFactor={2}
          />
        </>
      )}
    </MapContainer>
  );
};

export default MapWithRoute;
