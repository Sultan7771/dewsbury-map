export const addBuildingMarker = (mapInstance, coordinates) => {
  if (mapInstance.getLayer("building-marker")) {
    mapInstance.removeLayer("building-marker");
    mapInstance.removeSource("building-marker");
  }

  mapInstance.addSource("building-marker", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
        },
      ],
    },
  });

  mapInstance.addLayer({
    id: "building-marker",
    type: "symbol",
    source: "building-marker",
    layout: {
      "icon-image": "custom-marker",
      "icon-size": 0.1,
      "icon-anchor": "center",
      "icon-offset": [0, -5],
      "icon-allow-overlap": true,
    },
  });
};
