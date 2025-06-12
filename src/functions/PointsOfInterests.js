import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

// Utility function to update buildings based on Firestore query
const updateBuildingFlags = async (collectionName, flagKey, conditionKey, buildingFeatures) => {
  const db = getFirestore();
  const q = query(collection(db, collectionName), where(conditionKey, "==", true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.warn(`⚠️ No documents found for ${flagKey}`);
    return 0;
  }

  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const osid = data.osid;

    if (!osid) {
      console.warn(`❌ Missing osid in document:`, data);
      continue;
    }

    const matchedFeature = buildingFeatures.find(
      (feature) => feature.properties?.osid === osid
    );

    if (matchedFeature) {
      matchedFeature.properties[flagKey] = true;
      updatedCount++;
    } else {
      console.warn(`❌ No match found in buildings for osid: ${osid}`);
    }
  }

  console.log(`✅ ${updatedCount} buildings updated with ${flagKey}`);
  return updatedCount;
};

// Main function to update both job and sales interest flags
export const markPointsOfInterest = async (map, buildingFeatures) => {
  const jobCount = await updateBuildingFlags("bizmapsbusiness", "hasJobs", "jobsAvailable", buildingFeatures);
  const salesCount = await updateBuildingFlags("bizmapsbusiness", "hasSales", "forSale", buildingFeatures);

  console.log(`🏁 POI update complete. Jobs: ${jobCount}, Sales: ${salesCount}`);
};
