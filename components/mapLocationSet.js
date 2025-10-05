if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(loadMap, function () {
    alert("Could not get your position");
  });
function loadMap(position) {
  const { latitude, longitude } = position.coords;
  const coords = [latitude, longitude];
  console.log(coords);
}
