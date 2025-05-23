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
                            coordinates: [...coordinates],
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
            layout: {
                "icon-image": "custom-sales-marker",
                "icon-size": 0.07,
                "icon-anchor": "bottom",
                "icon-allow-overlap": true,
            },
            paint: {
                // Move sales marker to the top-right (X: right, Y: up)
                "icon-translate": [15, -buildingHeight * 6 - 6],
                "icon-translate-anchor": "viewport"
            }
        });


        markers.push({ source: markerSourceId, layer: markerLayerId });
    }

    console.log(`🛍️ Total sales markers added: ${markers.length}`);
};
