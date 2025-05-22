// Updated map initialization logic with hasJobs-based coloring
// File: initializeMap.js

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
      position: [1.5, 90, 100],
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
              coordinates: [[]] // ← insert real grass coordinates
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
      paint: {
        "fill-color": "#39d353",
        "fill-opacity": 0.6
      }
    });

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
          ["==", ["get", "selected"], true], "#ffd700",        // Gold highlight
          ["==", ["get", "hasJobs"], true], "#66e4c9",         // Vibrant teal (jobs)
          "#e4e7eb"                                            // Soft modern grey
        ],
        "fill-extrusion-height": [
          "case",
          ["==", ["get", "selected"], true],
          ["get", "calculatedHeight"],
          ["get", "defaultHeight"]
        ],
        "fill-extrusion-base": 0.5,                            // Slight base offset
        "fill-extrusion-opacity": 1.0,                         // Crisp, non-faded look
        "fill-extrusion-outline-color": "#c4ccd3"              // Light steel edge
      }
    });


    await addJobMarkers(mapInstance, data.features);
    handleBuildingClick(mapInstance, setSelectedBuilding);
    setMap(mapInstance);
  });

  return mapInstance;
};
