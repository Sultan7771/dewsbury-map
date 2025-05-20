import { addBuildingMarker } from "./addBuildingMarker";

export const handleBuildingClick = (mapInstance, setSelectedBuilding) => {
  mapInstance.on("click", "3d-buildings", (e) => {
    if (!e.features?.length) return;

    const clickedBuilding = e.features[0];
    const buildingId = clickedBuilding.properties?.osid;
    const coordinates = clickedBuilding.geometry.coordinates[0][0];

    if (!buildingId) return;

    setSelectedBuilding(clickedBuilding);
    addBuildingMarker(mapInstance, coordinates);

    mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-color", [
      "case",
      ["==", ["get", "osid"], buildingId],
      "#e1c400",
      "#5cbeed",
    ]);

    mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-height", [
      "case",
      ["==", ["get", "osid"], buildingId],
      ["get", "calculatedHeight"],
      ["get", "defaultHeight"],
    ]);
  });
};
