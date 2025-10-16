// Location: src/pages/Map/initializeMap.js
import mapboxgl from "mapbox-gl";
import { MAP_STYLE } from "../MapBoxConfig";
import { fetchBuildingData } from "./fetchBuildingData";
import { handleBuildingClick } from "./handleBuildingClick";
import { markPointsOfInterest } from "./PointsOfInterests";

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
    // --- Lighting / sky ---
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

    // --- Terrain ---
    mapInstance.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.terrain-rgb",
      tileSize: 512,
      maxzoom: 15,
    });

    mapInstance.setTerrain({
      source: "mapbox-dem",
      exaggeration: 1,
    });

    // --- Contours (GeoJSON reprojected to WGS84) ---
    // Ensure file exists at: public/assets/SE23NEContours.wgs84.geojson
    const contoursUrl = `${process.env.PUBLIC_URL}/assets/SE23NEContours.wgs84.geojson`;

    mapInstance.addSource("contours", {
      type: "geojson",
      data: contoursUrl,
    });

    // (Optional) Auto-zoom to contour bounds once, proving they loaded
    let fittedContours = false;
    mapInstance.on("sourcedata", (e) => {
      if (fittedContours || e.sourceId !== "contours" || !mapInstance.isSourceLoaded("contours")) return;
      try {
        const src = mapInstance.getSource("contours");
        const fc = src && src._data; // same object provided to the source
        if (fc?.features?.length) {
          const bounds = new mapboxgl.LngLatBounds();
          for (const f of fc.features) {
            const walk = (g) => {
              const { type, coordinates } = g || {};
              if (!coordinates) return;
              if (type === "LineString") coordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));
              if (type === "MultiLineString") coordinates.flat().forEach(([lng, lat]) => bounds.extend([lng, lat]));
              if (type === "Polygon") coordinates.flat().forEach(([lng, lat]) => bounds.extend([lng, lat]));
              if (type === "MultiPolygon") coordinates.flat(2).forEach(([lng, lat]) => bounds.extend([lng, lat]));
            };
            if (f.geometry) walk(f.geometry);
          }
          if (!bounds.isEmpty()) {
            mapInstance.fitBounds(bounds, { padding: 40, maxZoom: 18 });
            fittedContours = true;
          }
        }
      } catch (_) {
        // no-op
      }
    });

    // Lines (LineString/MultiLineString)
    mapInstance.addLayer({
      id: "contour-lines",
      type: "line",
      source: "contours",
      filter: [
        "any",
        ["==", ["geometry-type"], "LineString"],
        ["==", ["geometry-type"], "MultiLineString"],
      ],
      paint: {
        // Red if no elevation property; otherwise simple stepped ramp
        "line-color": [
          "case",
          ["has", "elev"],
          [
            "step",
            ["to-number", ["get", "elev"]],
            "#c0c0c0", // <50
            50, "#9fb3ff",
            100, "#6f9cff",
            150, "#3b7dff",
            200, "#0a5cff"
          ],
          "#ff0000"
        ],
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, 1,
          16, 2.2,
          18, 3
        ],
        "line-opacity": 0.95
      },
    });

    // Polygon fallback (some contour exports are polygons)
    mapInstance.addLayer({
      id: "contour-polys-outline",
      type: "fill",
      source: "contours",
      filter: [
        "any",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["geometry-type"], "MultiPolygon"],
      ],
      paint: {
        "fill-color": "#000000",
        "fill-opacity": 0,
        "fill-outline-color": "#ff0000",
      },
    });

    // Labels (follow line), try common elevation property keys
    mapInstance.addLayer({
      id: "contour-labels",
      type: "symbol",
      source: "contours",
      layout: {
        "symbol-placement": "line",
        "text-field": [
          "to-string",
          ["coalesce", ["get", "elev"], ["get", "ELEVATION"], ["get", "elevation"], ["get", "contour"]]
        ],
        "text-size": 10,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#333",
        "text-halo-color": "#fff",
        "text-halo-width": 1,
      },
    });

    // --- Buildings + POIs ---
    const data = await fetchBuildingData();
    if (!data || !data.features || data.features.length === 0) {
      console.error("🚫 No building data available.");
      return;
    }

    await markPointsOfInterest(mapInstance, data.features);

    mapInstance.addSource("dewsbury-buildings", { type: "geojson", data });

    mapInstance.addLayer({
      id: "3d-buildings",
      type: "fill-extrusion",
      source: "dewsbury-buildings",
      paint: {
        "fill-extrusion-color": [
          "case",
          [
            "all",
            ["==", ["get", "hasJobs"], true],
            ["==", ["get", "hasSales"], true],
          ],
          "#FFD700",
          ["==", ["get", "hasJobs"], true],
          "#4CAF50",
          ["==", ["get", "hasSales"], true],
          "#E53935",
          ["==", ["get", "selected"], true],
          "#2196F3",
          "#D3D3D3",
        ],
        "fill-extrusion-height": [
          "case",
          ["==", ["get", "selected"], true],
          ["get", "calculatedHeight"],
          ["*", ["get", "defaultHeight"], 0.1],
        ],
        "fill-extrusion-base": 0.5,
        "fill-extrusion-opacity": 1.0,
        "fill-extrusion-outline-color": "#B3BEC7",
      },
    });

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

    // Keep contours on top of everything else
    mapInstance.on("idle", () => {
      ["contour-lines", "contour-polys-outline", "contour-labels"].forEach((id) => {
        if (mapInstance.getLayer(id)) mapInstance.moveLayer(id);
      });
    });

    // Interactions
    handleBuildingClick(mapInstance, setSelectedBuilding);
    setMap(mapInstance);
  });

  return mapInstance;
};
