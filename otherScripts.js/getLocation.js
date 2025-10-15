const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve([latitude, longitude]);
        },
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    }
  });
};

export { getCurrentLocation };
