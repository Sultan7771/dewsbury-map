import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { calculateCentroid } from "./calculateCentroid";

export const addSalesMarkers = async (map, buildingFeatures) => {
    const db = getFirestore();
    const q = query(collection(db, "bizmapsbusiness"), where("sales", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.warn("⚠️ No businesses with sales found.");
        return;
    }

    const markers = [];

    for (const doc of snapshot.docs) {
        const business = doc.data();
        const osid = business.osid;

        if (!osid) continue;

        const matchedFeature = buildingFeatures.find(
            (feature) => feature.properties?.osid === osid
        );

        if (!matchedFeature) {
            console.warn(`❌ No match for sales osid: ${osid}`);
            continue;
        }

        const coordinates = calculateCentroid(matchedFeature.geometry.coordinates);

        // Deterministic hash offset from osid
        const offsetMultiplier = Array.from(osid).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
        const angle = (offsetMultiplier / 10) * 2 * Math.PI;
        const offsetDistance = 0.0001; // ≈5–6 meters

        const offsetLng = Math.cos(angle) * offsetDistance;
        const offsetLat = Math.sin(angle) * offsetDistance;

        const offsetCoordinates = [
            coordinates[0] + offsetLng,
            coordinates[1] + offsetLat,
        ];

        const buildingHeight = matchedFeature.properties?.calculatedHeight || 20;

        const markerSourceId = `sales-marker-${osid}`;
        const markerLayerId = `sales-layer-${osid}`;

        if (map.getLayer(markerLayerId)) map.removeLayer(markerLayerId);
        if (map.getSource(markerSourceId)) map.removeSource(markerSourceId);

        map.addSource(markerSourceId, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: offsetCoordinates,
                        },
                        properties: {
                            osid,
                            iconHeightOffset: buildingHeight + 2
                        },
                    },
                ],
            },
        });

        map.addLayer({
            id: markerLayerId,
            type: "symbol",
            source: markerSourceId,
            minzoom: 16, // 👈 only shows at closer zoom
            layout: {
                "icon-image": "custom-sales-marker",
                "icon-size": 0.045,
                "icon-anchor": "top",
                "icon-allow-overlap": false, // 👈 prevents icon stacking
                "icon-ignore-placement": false
            },
            paint: {
                "icon-translate": [0, -buildingHeight * 0.1 * 2],
            }
        });

        markers.push({ source: markerSourceId, layer: markerLayerId });
    }

    console.log(`🛍️ Total sales markers added: ${markers.length}`);
};
