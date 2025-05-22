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

    const updatedFeatures = currentData.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        selected: feature.properties.osid === clickedId
      }
    }));

    source.setData({
      ...currentData,
      features: updatedFeatures
    });
  });
};
