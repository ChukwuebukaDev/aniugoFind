const startNavigation = (map, from, to) => {
  if (!map || !from || !to) return;

  // Remove previous navigation if exists
  if (map._navigationControl) {
    map.removeControl(map._navigationControl);
  }

  const routingControl = L.Routing.control({
    waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
    router: L.Routing.mapbox(MAPBOX_TOKEN, {
      profile: 'mapbox/driving', // can be walking, cycling, driving-traffic
      language: 'en',
      steps: true, // enables turn-by-turn step data
    }),
    show: false,
    addWaypoints: false,
    routeWhileDragging: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    lineOptions: {
      styles: [
        { color: '#007AFF', weight: 6, opacity: 0.8 },
        { color: '#FFFFFF', weight: 2, opacity: 0.5 },
      ],
    },
    createMarker: (i, wp, nWps) => {
      return L.marker(wp.latLng, {
        icon: L.icon({
          iconUrl:
            i === 0
              ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png' // start icon
              : 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // destination icon
          iconSize: [25, 25],
        }),
      });
    },
  }).addTo(map);

  map._navigationControl = routingControl;

  // Center on route start
  map.setView([from.lat, from.lng], 14);
};
