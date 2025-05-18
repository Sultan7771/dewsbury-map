import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN, MAP_STYLE } from "../MapBoxConfig";
import BuildingInfoWindow from "./BuildingInfoWindow";
import "./MapComponent.css";
import Navbar from "./Navbar";

mapboxgl.accessToken = MAPBOX_TOKEN;

const MAX_HEIGHT = 50;   // Maximum building height to avoid overflow
const MIN_HEIGHT = 5;    // Minimum height to keep buildings visible

// Utility: Get building height from OS data properties
const getBuildingHeight = (properties) => {
  const height =
    properties.relativeheightmaximum ||
    properties.height_relativemax_m ||
    properties.absoluteheightmaximum ||
    10; // Default height if not found

  // Ensure height is valid and within bounds
  return Math.min(Math.max(height, MIN_HEIGHT), MAX_HEIGHT);
};

// Fetch building data from multiple files
const fetchBuildingData = async () => {
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
      if (data.features && data.features.length > 0) {
        data.features.forEach((feature) => {
          if (feature.properties.osid) {
            feature.id = feature.properties.osid;
            // Store the calculated height in properties for easy access
            feature.properties.calculatedHeight = getBuildingHeight(feature.properties);
            // Store 10% height for default display
            feature.properties.defaultHeight = feature.properties.calculatedHeight * 0.1;
          } else {
            console.warn("Building without OS ID:", feature);
          }
        });
        features = [...features, ...data.features];
      }
    }

    return { type: "FeatureCollection", features };
  } catch (error) {
    console.error("Error fetching building data:", error);
    return null;
  }
};

// Event Handler: Building Click to print details and change appearance
const handleBuildingClick = (mapInstance, setSelectedBuilding) => {
  mapInstance.on("click", "3d-buildings", (e) => {
    if (!e.features || e.features.length === 0) return;

    const clickedBuilding = e.features[0];
    const buildingId = clickedBuilding.properties.osid;
    const buildingHeight = clickedBuilding.properties.calculatedHeight || getBuildingHeight(clickedBuilding.properties);

    if (!buildingId) {
      console.warn("Clicked building has no OS ID.");
      return;
    }

    setSelectedBuilding(clickedBuilding);
    
    // Change the color and height of the clicked building
    mapInstance.setPaintProperty(
      "3d-buildings",
      "fill-extrusion-color",
      [
        "case",
        ["==", ["get", "osid"], buildingId],
        "#000000", // Black for selected
        "#51bbd6"  // Blue for others
      ]
    );

    // Set height - selected building to full height, others to 10% height
    mapInstance.setPaintProperty(
      "3d-buildings",
      "fill-extrusion-height",
      [
        "case",
        ["==", ["get", "osid"], buildingId],
        ["get", "calculatedHeight"], // Full height for selected
        ["get", "defaultHeight"]    // 10% height for others
      ]
    );
  });

  // Change cursor on hover
  mapInstance.on("mouseenter", "3d-buildings", () => {
    mapInstance.getCanvas().style.cursor = "pointer";
  });

  mapInstance.on("mouseleave", "3d-buildings", () => {
    mapInstance.getCanvas().style.cursor = "";
  });
};

// Initialize the map and its layers
const initializeMap = async (mapContainer, setMap, setSelectedBuilding) => {
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

  mapInstance.scrollZoom.enable();
  mapInstance.dragPan.enable();
  mapInstance.dragRotate.enable();
  mapInstance.touchZoomRotate.enable();

  mapInstance.on("load", async () => {
    mapInstance.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 15,
    });

    mapInstance.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    const data = await fetchBuildingData();
    if (!data || data.features.length === 0) {
      console.error("No building data available for rendering.");
      return;
    }

    mapInstance.addSource("dewsbury-buildings", {
      type: "geojson",
      data: data,
    });

    mapInstance.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "dewsbury-buildings",
      paint: {
        "fill-extrusion-color": "#51bbd6",
        "fill-extrusion-height": ["get", "defaultHeight"], // Start with 10% height for all
        "fill-extrusion-opacity": 0.6,
        "fill-extrusion-vertical-gradient": true,
      },
    });

    handleBuildingClick(mapInstance, setSelectedBuilding);
    setMap(mapInstance);
  });

  return mapInstance;
};

// Main Map Component
const MapComponent = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    if (!map) {
      initializeMap(mapContainer, setMap, setSelectedBuilding);
    }

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  return (
    <div className="map-container" style={{ position: "relative" }}>
      <div ref={mapContainer} className="mapboxgl-map" style={{ height: "100vh" }} />
      {selectedBuilding && (
        <BuildingInfoWindow
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
      <Navbar />
    </div>
  );
};

export default MapComponent;