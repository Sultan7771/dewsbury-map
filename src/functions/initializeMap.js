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

    mapInstance.setLight({
      anchor: "map",
      color: "#ffffff",
      intensity: 0.6,
      position: [1.5, 90, 100], // top-down light
    });
    mapInstance.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-color": "#aaccff",
        "sky-atmosphere-sun": [0.0, 90.0],
        "sky-atmosphere-sun-intensity": 25
      }
    });

    // Add terrain (optional but recommended for 3D maps)
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

    mapInstance.addSource("grass-areas", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [ /* array of lng/lat pairs forming a grassy area */]
              ]
            },
            properties: {}
          }
        ]
      }
    });

    mapInstance.addLayer({
      id: "grass-layer",
      type: "fill",
      source: "grass-areas",
      layout: {},
      paint: {
        "fill-color": "#39d353", // vibrant green
        "fill-opacity": 0.6
      }
    });

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
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "calculatedHeight"],
          0, "#3b0a67",      // deep royal purple (base)
          10, "#7015cb",     // vivid violet
          20, "#0080ff",     // bright azure
          35, "#00ffe0",     // turquoise neon
          50, "#00ff7f",     // neon green
          75, "#f5ff00",     // highlighter yellow
          100, "#ff7300"     // vibrant orange
        ],

        "fill-extrusion-height": ["get", "calculatedHeight"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.9,
        "fill-extrusion-outline-color": "#111111" // crisp shadowy edges
      }
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
