// Handles building selection logic
// File: handleBuildingClick.js

let lastSelectedId = null;

export const handleBuildingClick = (mapInstance, setSelectedBuilding) => {
  mapInstance.on("click", "3d-buildings", (e) => {
    if (!e.features?.length) return;

    const clicked = e.features[0];
    const clickedId = clicked.properties.osid;
    if (!clickedId) return;

    setSelectedBuilding(clicked);

    const source = mapInstance.getSource("dewsbury-buildings");
    const currentData = source._data;

    const updatedFeatures = currentData.features.map((feature) => {
      const isSelected = feature.properties.osid === clickedId;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          selected: isSelected,
          calculatedHeight: isSelected
            ? feature.properties.defaultHeight
            : feature.properties.defaultHeight * 0.1, // fallback to 10%
        },
      };
    });

    source.setData({
      ...currentData,
      features: updatedFeatures,
    });
  });
};
