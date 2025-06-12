import mapboxgl from "mapbox-gl";
import { MAP_STYLE } from "../MapBoxConfig";
import { fetchBuildingData } from "./fetchBuildingData";
import { handleBuildingClick } from "./handleBuildingClick";
import { markPointsOfInterest } from "./PointsOfInterests"; // ✅ Unified marker logic

export const initializeMap = async (
  mapContainer,
  setMap,
  setSelectedBuilding
) => {
  const mapInstance = new mapboxgl.Map({
    container: mapContainer.current,
    style: MAP_STYLE,
    center: [-1.6302, 53.6911],
    zoom: 17,
    pitch: 60,
    bearing: -30,
    projection: "globe",
    maxZoom: 20,
    minZoom: 15,
  });

  mapInstance.on("load", async () => {
    // Optional lighting and sky setup
    mapInstance.setLight({
      anchor: "map",
      color: "#ffffff",
      intensity: 0.6,
      position: [1.5, 90, 100],
    });

    mapInstance.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-color": "#aaccff",
        "sky-atmosphere-sun": [0.0, 90.0],
        "sky-atmosphere-sun-intensity": 25,
      },
    });

    mapInstance.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 15,
    });

    mapInstance.setTerrain({
      source: "mapbox-dem",
      exaggeration: 1.5,
    });

    // Fetch and render buildings
    const data = await fetchBuildingData();
    if (!data || !data.features || data.features.length === 0) {
      console.error("🚫 No building data available.");
      return;
    }

    // ✅ Update building properties with POIs
    await markPointsOfInterest(mapInstance, data.features);

    // Add building source
    mapInstance.addSource("dewsbury-buildings", {
      type: "geojson",
      data,
    });

    // 3D building layer
    mapInstance.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "dewsbury-buildings",
      paint: {
        "fill-extrusion-color": [
          "case",
          // Both jobs + sales
          [
            "all",
            ["==", ["get", "hasJobs"], true],
            ["==", ["get", "hasSales"], true],
          ],
          "#FFD700", // gold

          // Jobs only
          ["==", ["get", "hasJobs"], true],
          "#4CAF50", // elegant green

          // Sales only
          ["==", ["get", "hasSales"], true],
          "#E53935", // strong red

          // Selected fallback color (optional)
          ["==", ["get", "selected"], true],
          "#2196F3", // blue

          // Default
          "#D3D3D3", // light grey
        ],

        "fill-extrusion-height": [
          "case",
          ["==", ["get", "selected"], true],
          ["get", "calculatedHeight"],
          ["*", ["get", "defaultHeight"], 0.1], // 10% of height
        ],
        "fill-extrusion-base": 0.5,
        "fill-extrusion-opacity": 1.0,
        "fill-extrusion-outline-color": "#B3BEC7",
      },
    });

    // Glow effect for selected building
    mapInstance.addLayer({
      id: "building-glow",
      type: "line",
      source: "dewsbury-buildings",
      filter: ["==", ["get", "selected"], true],
      paint: {
        "line-color": "#00ffff",
        "line-width": 33,
        "line-opacity": 0.7,
        "line-blur": 30,
      },
    });

    // Handle clicks on buildings
    handleBuildingClick(mapInstance, setSelectedBuilding);

    // Set map instance in state
    setMap(mapInstance);
  });

  return mapInstance;
};
