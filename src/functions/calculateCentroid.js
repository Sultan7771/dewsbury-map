export const calculateCentroid = (coordinates) => {
  let lngSum = 0;
  let latSum = 0;
  const points = coordinates[0];

  points.forEach(([lng, lat]) => {
    lngSum += lng;
    latSum += lat;
  });

  return [lngSum / points.length, latSum / points.length];
};
