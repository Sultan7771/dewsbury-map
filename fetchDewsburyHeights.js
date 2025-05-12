// Import the required modules
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Replace with your OS NGD API key
const apiKey = 'ALZCQtABtiUvfdlGkrF7cHxaFBHhoh9j';

// Bounding box coordinates for Dewsbury
const bbox = '-1.633,53.687,-1.627,53.694';

// Correct Collection ID for building height data
const collectionId = 'bld-fts-buildingpart-1';  // Use building part collection for accurate height data

// Base API URL
const baseApiUrl = `https://api.os.uk/features/ngd/ofa/v1/collections/${collectionId}/items?key=${apiKey}&bbox=${bbox}&limit=100`;

// Fetch data from OS NGD API
async function fetchBuildingData() {
  try {
    let page = 1;
    let nextUrl = baseApiUrl;
    let totalFeatures = 0;

    while (nextUrl) {
      console.log(`Fetching page ${page}...`);
      const response = await axios.get(nextUrl);

      if (response.status === 200) {
        const data = response.data;
        const features = data.features;
        totalFeatures += features.length;

        // Save each page to a separate file
        const outputPath = path.join(__dirname, `dewsbury_buildings_${page}.geojson`);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Page ${page} saved to: ${outputPath}`);

        // Check for the next page
        const nextLink = data.links.find(link => link.rel === 'next');
        nextUrl = nextLink ? nextLink.href : null;

        console.log(`Total features so far: ${totalFeatures}`);
        page++;
      } else {
        console.error(`Error: Received status code ${response.status}`);
        break;
      }
    }

    console.log('✅ All pages fetched successfully.');
  } catch (error) {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Execute the function
fetchBuildingData();
