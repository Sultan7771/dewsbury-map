import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN, MAP_STYLE } from "../MapBoxConfig";
import "./MapComponent.css";

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  // Fetch building data from multiple files using OS IDs
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
          // Assign OS ID as the unique feature ID directly on the feature object
          data.features.forEach((feature) => {
            if (feature.properties.osid) {
              feature.id = feature.properties.osid;
            } else {
              console.warn("Building without OS ID:", feature);
            }
          });
          features = [...features, ...data.features];
          console.log(`Page ${page}: Fetched ${data.features.length} features`);
        } else {
          console.warn(`Page ${page} contains no features`);
        }
      }

      console.log("Total Buildings Fetched:", features.length);
      return { type: "FeatureCollection", features };
    } catch (error) {
      console.error("Error fetching building data:", error);
      return null;
    }
  };

  // Get building height from OS data properties
  const getBuildingHeight = (properties) => {
    const height =
      properties.relativeheightmaximum ||
      properties.height_relativemax_m ||
      properties.absoluteheightmaximum ||
      10; // Default height if not found

    // Ensure the height is a valid number and cap at 50 meters
    if (typeof height !== "number" || isNaN(height) || height <= 0) {
      return 10;
    }

    return Math.min(height, 50); // Cap the maximum height at 50 meters
  };

  // Print height data of the selected building
  const printBuildingHeight = (building) => {
    const height = getBuildingHeight(building.properties);
    console.log(`Selected Building OS ID: ${building.properties.osid}`);
    console.log(`Building Height: ${height} meters`);
  };

  // Handle building click to print height
  const handleBuildingClick = (mapInstance) => {
    mapInstance.on("click", "3d-buildings", (e) => {
      if (!e.features || e.features.length === 0) return;

      const clickedBuilding = e.features[0];
      const buildingId = clickedBuilding.properties.osid;

      if (!buildingId) {
        console.warn("Clicked building has no OS ID.");
        return;
      }

      // Print the height data of the selected building
      printBuildingHeight(clickedBuilding);
      console.log("Selected Building OS ID:", buildingId);
    });

    // Change cursor on hover
    mapInstance.on("mouseenter", "3d-buildings", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });
    mapInstance.on("mouseleave", "3d-buildings", () => {
      mapInstance.getCanvas().style.cursor = "";
    });
  };

  // Animate building height based on proximity
  const animateBuildings = (mapInstance) => {
    mapInstance.on("move", () => {
      const zoom = mapInstance.getZoom();
      const maxHeight = Math.max(0, (zoom - 15) * 10);

      if (mapInstance.getLayer("3d-buildings")) {
        mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-height", [
          "interpolate",
          ["linear"],
          [
            "coalesce",
            ["get", "relativeheightmaximum"],
            ["get", "height_relativemax_m"],
            ["get", "absoluteheightmaximum"],
            3,
          ],
          0,
          0,
          20,
          maxHeight,
        ]);
        mapInstance.setPaintProperty("3d-buildings", "fill-extrusion-opacity", [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0.2,
          20,
          0.8,
        ]);
      }
    });
  };

  // Initialize the map
  useEffect(() => {
    const initializeMap = async () => {
      if (map) return;

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

      // Enable interactions
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
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              [
                "coalesce",
                ["get", "relativeheightmaximum"],
                ["get", "height_relativemax_m"],
                ["get", "absoluteheightmaximum"],
                3,
              ],
              0,
              "#f28cb1",
              10,
              "#f1f075",
              20,
              "#51bbd6",
              40,
              "#a29bfe",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              20,
              50,
            ],
            "fill-extrusion-opacity": 0.6,
            "fill-extrusion-vertical-gradient": true,
          },
        });

        animateBuildings(mapInstance);
        handleBuildingClick(mapInstance);
        setMap(mapInstance);
        console.log("3D terrain and building layer added.");
      });
    };

    initializeMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapboxgl-map" />
    </div>
  );
};

export default MapComponent;
