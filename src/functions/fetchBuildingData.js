// Modified to flag buildings with jobs from Firebase
// File: fetchBuildingData.js

import { getDocs, collection, getFirestore, query, where } from "firebase/firestore";
import { getBuildingHeight } from "./getBuildingHeight";

export const fetchBuildingData = async () => {
  let features = [];
  const totalPages = 7;
  const db = getFirestore();

  // 🔥 Get job-enabled business osids from Firebase
  const jobQuery = query(collection(db, "bizmapsbusiness"), where("jobsAvailable", "==", true));
  const jobSnapshot = await getDocs(jobQuery);
  const jobOsids = jobSnapshot.docs.map(doc => doc.data().osid);

  try {
    for (let page = 1; page <= totalPages; page++) {
      const response = await fetch(`/dewsbury_buildings_${page}.geojson`);
      if (!response.ok) {
        console.error(`Error fetching page ${page}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      data.features?.forEach((feature) => {
        const osid = feature.properties?.osid;
        if (osid) {
          feature.id = osid;
          feature.properties.calculatedHeight = getBuildingHeight(feature.properties);
          feature.properties.defaultHeight = feature.properties.calculatedHeight;
          feature.properties.selected = false;
          feature.properties.hasJobs = jobOsids.includes(osid); // ✅ Mark if job available
        }
      });

      features = [...features, ...data.features];
    }

    return { type: "FeatureCollection", features };
  } catch (error) {
    console.error("Error fetching building data:", error);
    return null;
  }
};
