// Posts carousel to Instagram via Graph API
// Images are uploaded to imgbb.com for stable public URLs (set IMGBB_API_KEY in .env)
const https = require('https');
const fs = require('fs');
const path = require('path');
const { instagram } = require('./config');

const { accountId, pageAccessToken: TOKEN, apiVersion: API_VER } = instagram;

// Load imgbb key from .env
const envPath = path.join(__dirname, '..', '.env');
const envRaw  = fs.readFileSync(envPath, 'utf8');
const IMGBB_KEY = envRaw.match(/IMGBB_API_KEY=(.+)/)?.[1]?.trim();

function apiCall(method, endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams({ access_token: TOKEN, ...params }).toString();
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/${API_VER}${endpoint}?${qs}`,
      method,
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function apiPost(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ access_token: TOKEN, ...params });
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/${API_VER}${endpoint}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { resolve(d); } });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Upload image to imgbb and return public URL
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!IMGBB_KEY) return reject(new Error('IMGBB_API_KEY not set in .env'));

    const base64 = fs.readFileSync(filePath).toString('base64');
    const body   = `key=${IMGBB_KEY}&image=${encodeURIComponent(base64)}`;

    const req = https.request({
      hostname: 'api.imgbb.com',
      path: '/1/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.success) resolve(json.data.url);
          else reject(new Error('imgbb error: ' + JSON.stringify(json)));
        } catch (e) {
          reject(new Error('imgbb parse error: ' + d.slice(0, 100)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function waitContainerReady(containerId, maxWait = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const r = await apiCall('GET', `/${containerId}`, { fields: 'status_code,status' });
    if (r.status_code === 'FINISHED') return true;
    if (r.status_code === 'ERROR') throw new Error('Container error: ' + JSON.stringify(r));
    await sleep(5000);
  }
  throw new Error('Timeout waiting for container');
}

async function postCarousel(carousel, slideFiles, sessionDir) {
  console.log('\n📸 Posting carousel to Instagram...');

  // Step 1: Upload all slides to imgbb
  console.log(`  Uploading ${slideFiles.length} slides to imgbb...`);
  const imageUrls = [];
  for (let i = 0; i < slideFiles.length; i++) {
    const url = await uploadImage(slideFiles[i]);
    imageUrls.push(url);
    console.log(`    Slide ${i + 1}/${slideFiles.length} → ${url}`);
  }

  // Step 2: Create media containers (with retry on transient errors)
  console.log('  Creating slide containers...');
  const childIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    let res;
    for (let attempt = 1; attempt <= 3; attempt++) {
      res = await apiPost(`/${accountId}/media`, {
        image_url: imageUrls[i],
        is_carousel_item: true,
      });
      if (!res.error) break;
      if (attempt < 3) {
        console.log(`    Slide ${i + 1} attempt ${attempt} failed, retrying...`);
        await sleep(3000);
      }
    }
    if (res.error) throw new Error(`Slide ${i + 1} container failed: ${res.error.message}`);
    childIds.push(res.id);
    console.log(`    Slide ${i + 1}/${slideFiles.length} ✓`);
    await sleep(1000);
  }

  // Step 3: Create carousel container
  console.log('  Creating carousel container...');
  const carouselRes = await apiPost(`/${accountId}/media`, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: carousel.caption,
  });
  if (carouselRes.error) throw new Error('Carousel container failed: ' + carouselRes.error.message);
  console.log(`  Container ID: ${carouselRes.id}`);

  // Step 4: Wait for processing
  console.log('  Waiting for processing...');
  await waitContainerReady(carouselRes.id);

  // Step 5: Publish
  console.log('  Publishing...');
  const pubRes = await apiPost(`/${accountId}/media_publish`, {
    creation_id: carouselRes.id,
  });
  if (pubRes.error) throw new Error('Publish failed: ' + pubRes.error.message);

  console.log(`  ✅ Carousel posted! Post ID: ${pubRes.id}`);
  return pubRes.id;
}

module.exports = { postCarousel };
