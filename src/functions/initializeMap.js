// File: initializeMap.js

import mapboxgl from "mapbox-gl";
import { MAP_STYLE } from "../MapBoxConfig";
import { fetchBuildingData } from "./fetchBuildingData";
import { handleBuildingClick } from "./handleBuildingClick";
import { addJobMarkers } from "./addJobMarkers";
import { addSalesMarkers } from "./addSalesMarkers"; // ✅ Import sales marker logic

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
    // Load job marker icon
    await new Promise((resolve, reject) => {
      mapInstance.loadImage("/icons/jobs_marker.png", (error, image) => {
        if (error) {
          console.error("❌ Failed to load jobs marker image:", error);
          reject(error);
        } else if (!mapInstance.hasImage("custom-marker")) {
          mapInstance.addImage("custom-marker", image, {
            sdf: false,
            pixelRatio: 2.0,
          });
          console.log("✅ Jobs marker image loaded.");
        }
        resolve();
      });
    });

    // Load sales marker icon
    await new Promise((resolve, reject) => {
      mapInstance.loadImage("/icons/sales.png", (error, image) => {
        if (error) {
          console.error("❌ Failed to load sales marker image:", error);
          reject(error);
        } else if (!mapInstance.hasImage("custom-sales-marker")) {
          mapInstance.addImage("custom-sales-marker", image, {
            sdf: false,
            pixelRatio: 2.0,
          });
          console.log("✅ Sales marker image loaded.");
        }
        resolve();
      });
    });

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
          "case",
          ["all", ["==", ["get", "selected"], true], ["==", ["get", "hasJobs"], true]],
          "#00c7b1", // selected + has jobs

          ["all", ["==", ["get", "selected"], true], ["!=", ["get", "hasJobs"], true]],
          "#ebebeb", // selected only

          ["==", ["get", "hasJobs"], true],
          "#66e4c9", // has jobs

          "#e4e7eb", // default
        ],
        "fill-extrusion-height": [
          "case",
          ["==", ["get", "selected"], true],
          ["get", "calculatedHeight"],
          ["get", "defaultHeight"],
        ],
        "fill-extrusion-base": 0.5,
        "fill-extrusion-opacity": 1.0,
        "fill-extrusion-outline-color": "#c4ccd3",
      },
    });

    mapInstance.addLayer({
      id: "building-glow",
      type: "line",
      source: "dewsbury-buildings",
      filter: ["==", ["get", "selected"], true], // 👈 apply only to selected building
      paint: {
        "line-color": "#00ffff", // Glow color (neon cyan)
        "line-width": 33,
        "line-opacity": 0.7,
        "line-blur": 30
      }
    });


    // Add markers
    await addJobMarkers(mapInstance, data.features);
    await addSalesMarkers(mapInstance, data.features);

    // Handle clicks on buildings
    handleBuildingClick(mapInstance, setSelectedBuilding);

    // Set the map instance to state
    setMap(mapInstance);
  });

  return mapInstance;
};
