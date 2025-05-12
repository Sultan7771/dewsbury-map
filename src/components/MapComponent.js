import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MAPBOX_TOKEN, MAP_STYLE } from "../MapBoxConfig";
import "./MapComponent.css";

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  // Fetch building data from multiple files
  const fetchBuildingData = async () => {
    let features = [];
    const totalPages = 7; // Update this if you get more files

    try {
      for (let page = 1; page <= totalPages; page++) {
        const response = await fetch(`/dewsbury_buildings_${page}.geojson`);
        if (!response.ok) {
          console.error(`Error fetching page ${page}: ${response.status}`);
          continue; // Try the next page even if one fails
        }

        const data = await response.json();
        if (data.features && data.features.length > 0) {
          features = [...features, ...data.features];
          console.log(`Page ${page}: Fetched ${data.features.length} features`);
        } else {
          console.warn(`Page ${page} contains no features`);
        }
      }

      console.log("Total Buildings Fetched:", features.length);

      // Filter valid buildings with height
      const validBuildings = features.filter((feature) => {
        const height =
          feature.properties.relativeheightmaximum ||
          feature.properties.height_relativemax_m ||
          feature.properties.absoluteheightmaximum;
        if (height) {
          console.log(
            "Valid Building:",
            feature.properties.description,
            "Height:",
            height
          );
          return true;
        } else {
          console.warn(
            "Missing Height:",
            feature.properties.description || "Unnamed Building",
            "Type:",
            feature.properties.theme,
            "ID:",
            feature.properties.osid
          );
          return false;
        }
      });

      console.log("Valid Buildings Count:", validBuildings.length);
      return { type: "FeatureCollection", features: validBuildings };
    } catch (error) {
      console.error("Error fetching building data:", error);
      return null;
    }
  };

  // Initialize the Map
  const initializeMap = async () => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-1.6302, 53.6911], // Dewsbury coordinates
      zoom: 15,
      pitch: 60,
    });

    mapInstance.on("load", async () => {
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
              3, // Default height if no data
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
            "coalesce",
            ["get", "relativeheightmaximum"],
            ["get", "height_relativemax_m"],
            ["get", "absoluteheightmaximum"],
            3,
          ],
        },
      });

      console.log("3D building layer added.");
    });

    setMap(mapInstance);
  };

  useEffect(() => {
    if (!map) initializeMap();
  }, [map]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="mapboxgl-map" />
    </div>
  );
};

export default MapComponent;
