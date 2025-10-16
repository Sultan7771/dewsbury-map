// fetch_southampton_buildingparts.js
// Node 18+
// npm i axios

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ── CONFIG ────────────────────────────────────────────────────────────────────
const apiKey = 'ALZCQtABtiUvfdlGkrF7cHxaFBHhoh9j'; // your OS NGD key
const collectionId = 'bld-fts-buildingpart-1';

// The four polygon corners you gave (lon, lat)
const poly = [
  [-1.47483339, 50.93370913],
  [-1.46344943, 50.93365735],
  [-1.46336657, 50.94085097],
  [-1.47475226, 50.94090276],
];

// Turn polygon into bbox: minLon,minLat,maxLon,maxLat
const lons = poly.map(p => p[0]);
const lats = poly.map(p => p[1]);
const bbox = [
  Math.min(...lons),  // minX (lon)
  Math.min(...lats),  // minY (lat)
  Math.max(...lons),  // maxX (lon)
  Math.max(...lats),  // maxY (lat)
].join(',');

// NGD OFA endpoint
const baseApiUrl =
  `https://api.os.uk/features/ngd/ofa/v1/collections/${collectionId}/items` +
  `?key=${apiKey}&bbox=${bbox}&limit=100`;

// ── FETCH + MERGE PAGES ───────────────────────────────────────────────────────
async function fetchBuildingData() {
  try {
    let page = 1;
    let nextUrl = baseApiUrl;
    const allFeatures = [];

    while (nextUrl) {
      console.log(`Fetching page ${page}…`);
      const { data, status } = await axios.get(nextUrl);
      if (status !== 200) {
        console.error(`HTTP ${status} on page ${page}`);
        break;
      }

      const features = Array.isArray(data?.features) ? data.features : [];
      allFeatures.push(...features);

      // Save the raw page (optional, for debugging/audit)
      const pageOut = path.join(__dirname, `southampton_buildings_page_${page}.geojson`);
      fs.writeFileSync(pageOut, JSON.stringify(data, null, 2));
      console.log(`Saved page ${page} → ${pageOut} (${features.length} features)`);

      // Follow 'next' link if present
      const nextLink = Array.isArray(data?.links)
        ? data.links.find(l => l.rel === 'next')
        : null;
      nextUrl = nextLink?.href || null;
      page++;
    }

    // Write one merged FeatureCollection
    const merged = {
      type: 'FeatureCollection',
      features: allFeatures,
    };
    const mergedOut = path.join(__dirname, `southampton_buildingparts_merged.geojson`);
    fs.writeFileSync(mergedOut, JSON.stringify(merged, null, 2));
    console.log(`\n✅ Done. Total features: ${allFeatures.length}`);
    console.log(`🗂  Merged file: ${mergedOut}`);
    console.log(`ℹ️  BBOX used: ${bbox}`);
  } catch (err) {
    if (err.response) {
      console.error(`API Error: ${err.response.status} ${err.response.statusText}`);
      console.error(err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Error:', err.message);
    }
  }
}

fetchBuildingData();
