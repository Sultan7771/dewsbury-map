// Handles building selection logic
// File: handleBuildingClick.js

let lastSelectedId = null;

const animateExtrusion = (source, features, targetId, duration = 300) => {
  const start = performance.now();

  const original = features.map(f => ({ 
    ...f,
    properties: {
      ...f.properties,
      calculatedHeight: f.properties.defaultHeight * 0.1,
    },
  }));

  const targetHeights = features.map(f => ({
    ...f,
    properties: {
      ...f.properties,
      calculatedHeight: f.properties.osid === targetId
        ? f.properties.defaultHeight
        : f.properties.defaultHeight * 0.1,
    },
  }));

  const animate = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);

    const interpolated = original.map((feature, i) => {
      const target = targetHeights[i];
      const isTarget = feature.properties.osid === targetId;

      const interpolatedHeight = feature.properties.defaultHeight * (
        isTarget ? 0.1 + 0.9 * progress : 0.1
      );

      return {
        ...feature,
        properties: {
          ...feature.properties,
          selected: isTarget,
          calculatedHeight: interpolatedHeight,
        },
      };
    });

    source.setData({
      type: "FeatureCollection",
      features: interpolated,
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

export const handleBuildingClick = (mapInstance, setSelectedBuilding) => {
  mapInstance.on("click", "3d-buildings", (e) => {
    if (!e.features?.length) return;

    const clicked = e.features[0];
    const clickedId = clicked.properties.osid;
    if (!clickedId) return;

    setSelectedBuilding(clicked);

    const source = mapInstance.getSource("dewsbury-buildings");
    const currentData = source._data;

    animateExtrusion(source, currentData.features, clickedId);
  });
};
