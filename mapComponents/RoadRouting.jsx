// import { useEffect, useState } from "react";
// import { useMap, Polyline, Tooltip } from "react-leaflet";
// import L from "leaflet";
// import "leaflet-routing-machine";

// function formatDistance(meters) {
//   if (meters < 1000) return `${Math.round(meters)} m`;
//   return `${(meters / 1000).toFixed(2)} km`;
// }

// export default function RoadRouting({ points }) {
//   const map = useMap();
//   const [routes, setRoutes] = useState([]);

//   useEffect(() => {
//     if (!map || !points || points.length < 2) return;

//     let isCancelled = false;
//     const tempRoutes = [];
//     const activeControls = [];

//     const createRoute = (start, end) => {
//       return new Promise((resolve) => {
//         const control = L.Routing.control({
//           waypoints: [
//             L.latLng(start.lat, start.lng),
//             L.latLng(end.lat, end.lng),
//           ],
//           lineOptions: { styles: [{ color: "#1976d2", weight: 3 }] },
//           createMarker: () => null,
//           routeWhileDragging: false,
//           addWaypoints: false,
//           show: false,
//           containerClassName: "hidden",
//         }).addTo(map);

//         activeControls.push(control);

//         control.on("routesfound", (e) => {
//           if (isCancelled) return;

//           const route = e.routes[0];
//           const coords = route.coordinates.map((c) => [c.lat, c.lng]);
//           const midIndex = Math.floor(coords.length / 2);

//           tempRoutes.push({
//             coordinates: coords,
//             distance: route.summary.totalDistance,
//             midpoint: coords[midIndex],
//           });

//           // ✅ Only remove control if still attached to a map
//           if (control._map) {
//             map.removeControl(control);
//           }

//           resolve();
//         });

//         control.on("routingerror", () => {
//           // ✅ Handle network/routing failure gracefully
//           if (control._map) {
//             map.removeControl(control);
//           }
//           resolve();
//         });
//       });
//     };

//     const createAllRoutes = async () => {
//       for (let i = 0; i < points.length - 1; i++) {
//         await createRoute(points[i], points[i + 1]);
//       }
//       if (!isCancelled) setRoutes([...tempRoutes]);
//     };

//     createAllRoutes();

//     return () => {
//       isCancelled = true;
//       // ✅ Cleanup all routing controls safely
//       activeControls.forEach((control) => {
//         if (control._map) {
//           try {
//             map.removeControl(control);
//           } catch (err) {
//             console.warn("Control cleanup skipped:", err);
//           }
//         }
//       });
//     };
//   }, [points, map]);

//   return (
//     <>
//       {routes.map((r, idx) => (
//         <Polyline
//           key={idx}
//           positions={r.coordinates}
//           pathOptions={{ color: "#1976d2", weight: 3 }}
//         >
//           <Tooltip
//             direction="center"
//             permanent
//             offset={[0, -10]}
//             interactive={false}
//           >
//             {formatDistance(r.distance)}
//           </Tooltip>
//         </Polyline>
//       ))}
//     </>
//   );
// }
