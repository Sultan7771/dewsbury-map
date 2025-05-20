import { getBuildingHeight } from "./getBuildingHeight";

export const fetchBuildingData = async () => {
  let features = [];
  const totalPages = 7;

  try {
    for (let page = 1; page <= totalPages; page++) {
      const response = await fetch(`/dewsbury_buildings_${page}.geojson`);
      if (!response.ok) {
        console.error(`Error fetching page ${page}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      data.features?.forEach((feature) => {
        if (feature.properties?.osid) {
          feature.id = feature.properties.osid;
          feature.properties.calculatedHeight = getBuildingHeight(feature.properties);
          feature.properties.defaultHeight = feature.properties.calculatedHeight * 0.1;
        }
      });

      features = [...features, ...data.features];
    }

    return { type: "FeatureCollection", features };
  } catch (error) {
    console.error("Error fetching building data:", error);
    return null;
  }
};
