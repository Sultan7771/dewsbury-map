// fetch_ngd_transport_and_sites.js
// Node 18+  |  npm i axios
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = 'ALZCQtABtiUvfdlGkrF7cHxaFBHhoh9j';

// AOI polygon -> bbox (lon,lat)
const poly = [
  [-1.47483339, 50.93370913],
  [-1.46344943, 50.93365735],
  [-1.46336657, 50.94085097],
  [-1.47475226, 50.94090276],
];
const bbox = (() => {
  const xs = poly.map(p=>p[0]), ys = poly.map(p=>p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].join(',');
})();

const ROOT = 'https://api.os.uk/features/ngd/ofa/v1';

const targets = [
  { id: 'trn-ntwk-pathlink-3', filter: '' },
  { id: 'trn-ntwk-pavementlink-1', filter: '' },
  // optional lanes painted on the road surface:
  // { id: 'trn-ntwk-cyclelane-1', filter: '' },
];

async function fetchAll(collectionId, bbox, filter='') {
  let url = `${ROOT}/collections/${collectionId}/items?key=${apiKey}&bbox=${encodeURIComponent(bbox)}&limit=100`;
  if (filter) url += `&filter=${encodeURIComponent(filter)}`;
  const all = [];
  let next = url, page = 1;
  while (next) {
    console.log(`[${collectionId}] page ${page}…`);
    const { data, status } = await axios.get(next);
    if (status !== 200) throw new Error(`HTTP ${status}`);
    all.push(...(data.features ?? []));
    const nextLink = (data.links ?? []).find(l => l.rel === 'next');
    next = nextLink?.href || null;
    page++;
  }
  return all;
}

function safe(s){ return s.replace(/[^a-z0-9-_]/gi,'_'); }

(async () => {
  try {
    for (const t of targets) {
      const feats = await fetchAll(t.id, bbox, t.filter);
      const out = path.join(__dirname, `${t.id}_${safe(bbox)}.geojson`);
      fs.writeFileSync(out, JSON.stringify({ type:'FeatureCollection', features:feats }, null, 2));
      console.log(`✅ ${t.id}: ${feats.length} → ${out}\n`);
    }
    console.log('Done. BBOX:', bbox);
  } catch (err) {
    if (err.response) {
      console.error(`API Error: ${err.response.status} ${err.response.statusText}`);
      console.error(err.response.data);
    } else {
      console.error(err.stack || err.message);
    }
  }
})();
