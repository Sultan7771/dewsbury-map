import mapboxgl from "mapbox-gl";
import { MAP_STYLE } from "../MapBoxConfig";
import { fetchBuildingData } from "./fetchBuildingData";
import { handleBuildingClick } from "./handleBuildingClick";
import { addJobMarkers } from "./addJobMarkers";

export const initializeMap = async (mapContainer, setMap, setSelectedBuilding) => {
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
    // Load marker icon before adding any symbol layers
    await new Promise((resolve, reject) => {
      mapInstance.loadImage("/icons/jobs_marker.png", (error, image) => {
        if (error) {
          console.error("❌ Failed to load marker image:", error);
          reject(error);
        } else if (!mapInstance.hasImage("custom-marker")) {
          mapInstance.addImage("custom-marker", image, {
            sdf: false,
            pixelRatio: 2.0,
          });
          console.log("✅ Custom marker image loaded.");
        }
        resolve();
      });
    });

    // Add terrain (optional but recommended for 3D maps)
    mapInstance.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 15,
    });
    mapInstance.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // Load building geometry with height
    const data = await fetchBuildingData();
    if (!data || !data.features || data.features.length === 0) {
      console.error("🚫 No building data available.");
      return;
    }

    mapInstance.addSource("dewsbury-buildings", {
      type: "geojson",
      data,
    });

    mapInstance.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "dewsbury-buildings",
      paint: {
        "fill-extrusion-color": "#51bbd6",
        "fill-extrusion-height": ["get", "calculatedHeight"],
        "fill-extrusion-opacity": 0.75,
      },
    });

    // ✅ Add job markers using loaded buildings
    await addJobMarkers(mapInstance, data.features);

    // 🧭 Enable interactivity
    handleBuildingClick(mapInstance, setSelectedBuilding);

    // Store the map instance in state
    setMap(mapInstance);
  });

  return mapInstance;
};
