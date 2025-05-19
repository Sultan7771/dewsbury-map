import React, { useEffect, useRef, useState, useContext } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN, MAP_STYLE } from "../MapBoxConfig";
import BuildingInfoWindow from "./BuildingInfoWindow";
import "./MapComponent.css";
import Navbar from "./NavBar";
import FeedWindow from "./FeedWindow"; // Importing FeedWindow
import { AuthContext } from "../AuthContext";
import ProfileWindow from "./ProfileWindow"; // Importing ProfileWindow
import createCustomMarker from "../assets/ReactMarker"; // Import the custom marker

mapboxgl.accessToken = MAPBOX_TOKEN;

const MAX_HEIGHT = 50; // Maximum building height to avoid overflow
const MIN_HEIGHT = 5; // Minimum height to keep buildings visible

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
            feature.properties.calculatedHeight = getBuildingHeight(
              feature.properties
            );
            // Store 10% height for default display
            feature.properties.defaultHeight =
              feature.properties.calculatedHeight * 0.1;
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

const calculateCentroid = (coordinates) => {
  let lngSum = 0;
  let latSum = 0;
  const points = coordinates[0];

  points.forEach(([lng, lat]) => {
    lngSum += lng;
    latSum += lat;
  });

  const centroid = [
    lngSum / points.length, // Average longitude
    latSum / points.length  // Average latitude
  ];

  return centroid;
};


// Function to add a marker as a symbol layer
const addBuildingMarker = (mapInstance, coordinates) => {
  // Remove the existing marker layer if it exists
  if (mapInstance.getLayer("building-marker")) {
    mapInstance.removeLayer("building-marker");
    mapInstance.removeSource("building-marker");
  }

  // Add the marker as a symbol layer
  mapInstance.addSource("building-marker", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
        },
      ],
    },
  });

  mapInstance.addLayer({
    id: "building-marker",
    type: "symbol",
    source: "building-marker",
    layout: {
      "icon-image": "custom-marker", // Use the custom marker image
      "icon-size": 0.1, // Adjust size to be more proportional
      "icon-anchor": "center", // Center the icon
      "icon-offset": [0, -5], // Slightly raise above the building
      "icon-allow-overlap": true, // Ensure it stays on top of buildings
    },
  });
};

// Event Handler: Building Click
const handleBuildingClick = (mapInstance, setSelectedBuilding) => {
  mapInstance.on("click", "3d-buildings", (e) => {
    if (!e.features || e.features.length === 0) return;

    const clickedBuilding = e.features[0];
    const buildingId = clickedBuilding.properties.osid;
    const coordinates = clickedBuilding.geometry.coordinates[0][0];

    if (!buildingId) {
      console.warn("Clicked building has no OS ID.");
      return;
    }

    setSelectedBuilding(clickedBuilding);

    // Add a marker as a symbol layer on top of the building
    addBuildingMarker(mapInstance, coordinates);

    // Change the color and height of the clicked building
    mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-color", [
      "case",
      ["==", ["get", "osid"], buildingId],
      "#e1c400", // Selected color
      "#5cbeed", // Default color
    ]);

    // Set height - selected building to full height, others to 10% height
    mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-height", [
      "case",
      ["==", ["get", "osid"], buildingId],
      ["get", "calculatedHeight"],
      ["get", "defaultHeight"],
    ]);
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
    // Load the custom marker image correctly
    mapInstance.loadImage(
      "/icons/jobs_marker.png", // Path to your marker image
      (error, image) => {
        if (error) throw error;
        if (!mapInstance.hasImage("custom-marker")) {
          mapInstance.addImage("custom-marker", image, {
            sdf: false, // Set to false for non-SVG images
            pixelRatio: 2.0, // Adjust ratio for better sharpness
          });
          console.log("Custom marker image added successfully.");
        }
      }
    );

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
        // Base color for the buildings
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#e1c400", // Highlighted building color
          "#51bbd6", // Default building color
        ],

        // Add a gradient for realistic shading (darker at the base)
        "fill-extrusion-base": 0,
        "fill-extrusion-height": ["get", "calculatedHeight"],
        "fill-extrusion-opacity": 0.75,
        "fill-extrusion-vertical-gradient": true,

        // Add a shadow effect by adjusting light intensity and direction
        "fill-extrusion-ambient-occlusion": [
          "interpolate",
          ["linear"],
          ["get", "calculatedHeight"],
          0,
          0.3, // Low height = low shadow intensity
          50,
          0.1, // High height = high shadow intensity
        ],
        "fill-extrusion-light-intensity": 0.6,

        // Edge highlighting using color and light direction
        "fill-extrusion-outline-color": [
          "interpolate",
          ["linear"],
          ["get", "calculatedHeight"],
          0,
          "#333333", // Darker edges at the base
          50,
          "#999999", // Lighter edges at the top
        ],
      },
    });

    handleBuildingClick(mapInstance, setSelectedBuilding);
    setMap(mapInstance);
  });

  return mapInstance;
};

// Main Map Component
const MapComponent = () => {
  const { logout } = useContext(AuthContext);
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const markerRef = useRef(null); // Initialize marker reference

  useEffect(() => {
    if (!map) {
      initializeMap(mapContainer, setMap, setSelectedBuilding, markerRef); // Pass markerRef
    }

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  const toggleProfile = () => {
    setShowProfile((prev) => !prev);
  };

  return (
    <div className="map-container">
      <div
        ref={mapContainer}
        className="mapboxgl-map"
        style={{ height: "100vh" }}
      />
      {selectedBuilding && (
        <BuildingInfoWindow
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
      <div className="feed-window-wrapper">
        <FeedWindow />
      </div>
      {showProfile && (
        <div className="profile-window-wrapper">
          <ProfileWindow onClose={toggleProfile} />
        </div>
      )}
      <Navbar toggleProfile={toggleProfile} />
    </div>
  );
};

export default MapComponent;
