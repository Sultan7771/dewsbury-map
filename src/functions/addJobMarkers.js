import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { calculateCentroid } from "./calculateCentroid";

export const addJobMarkers = async (map, buildingFeatures) => {
    const db = getFirestore();
    const q = query(collection(db, "bizmapsbusiness"), where("jobsAvailable", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.warn("⚠️ No businesses with jobs available found.");
        return;
    }

    const markers = [];

    for (const doc of snapshot.docs) {
        const business = doc.data();
        const osid = business.osid;

        if (!osid) {
            console.warn(`❌ Missing osid in business document:`, business);
            continue;
        }

        const matchedFeature = buildingFeatures.find(
            (feature) => feature.properties?.osid === osid
        );

        let missingCount = 0;

        if (!matchedFeature) {
            missingCount++;
            console.warn(`❌ No match found in buildings for osid: ${osid}`);
            continue;
        }
        // ✅ Only run this if matchedFeature is valid
        const coordinates = calculateCentroid(matchedFeature.geometry.coordinates);
        const buildingHeight = matchedFeature.properties?.calculatedHeight || 20;

        // Offset coordinates slightly to avoid overlap with job marker
        const offsetLng = 0.00006; // ~5 meters east
        const offsetLat = 0.00004; // ~4 meters north
        const offsetCoordinates = [coordinates[0] + offsetLng, coordinates[1] + offsetLat];

        const markerSourceId = `job-marker-${osid}`;
        const markerLayerId = `job-layer-${osid}`;

        // Clean up if already exists (in dev reloads or hot module reload)
        if (map.getLayer(markerLayerId)) {
            console.log(`🔁 Removing existing layer: ${markerLayerId}`);
            map.removeLayer(markerLayerId);
        }
        if (map.getSource(markerSourceId)) {
            console.log(`🔁 Removing existing source: ${markerSourceId}`);
            map.removeSource(markerSourceId);
        }


        map.addSource(markerSourceId, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: offsetCoordinates, // 👈 new offset here
                        },
                        properties: {
                            osid,
                            iconHeightOffset: buildingHeight + 3,
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
                "icon-image": "custom-marker",
                "icon-size": 0.07,
                "icon-anchor": "top",
                "icon-allow-overlap": true,
            },
            paint: {
                "icon-translate": [0, -buildingHeight * 0.1 * 3],
                "icon-anchor": "bottom"
            }
        });


        console.log(`✅ Marker added for business: ${business.name} @ ${osid}`);
        markers.push({ source: markerSourceId, layer: markerLayerId });
        console.log(`📋 Checking business: ${business.name || "[no name]"}`);
        console.log(`🔑 osid: ${osid}`);

    }

    console.log(`🏁 Total job markers added: ${markers.length}`);
};
