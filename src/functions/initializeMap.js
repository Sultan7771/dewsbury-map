import mapboxgl from "mapbox-gl";
import { MAP_STYLE } from "../MapBoxConfig";
import { fetchBuildingData } from "./fetchBuildingData";
import { handleBuildingClick } from "./handleBuildingClick";

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
    mapInstance.loadImage("/icons/jobs_marker.png", (error, image) => {
      if (!error && !mapInstance.hasImage("custom-marker")) {
        mapInstance.addImage("custom-marker", image, { sdf: false, pixelRatio: 2.0 });
      }
    });

    mapInstance.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 15,
    });

    mapInstance.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    const data = await fetchBuildingData();
    if (!data) return;

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
        "fill-extrusion-height": ["get", "calculatedHeight"],
        "fill-extrusion-opacity": 0.75,
      },
    });

    handleBuildingClick(mapInstance, setSelectedBuilding);
    setMap(mapInstance);
  });

  return mapInstance;
};
