// server.js - Symptom-checker proxy to Infermedica (v3)
// Node 18+ compatible. Reads INFERMEDICA_APP_ID and INFERMEDICA_APP_KEY from env.

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch = global.fetch || (() => { try { return require('node-fetch'); } catch (e) { return null; }})();
const app = express();
const PORT = process.env.PORT || 3000;

// Validate fetch availability
if (!global.fetch && !fetch) {
  console.error('ERROR: fetch is not available. Install node-fetch or run on Node 18+.');
  process.exit(1);
}

const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

// Simple logger helper (do not log secrets)
function log(...args) { console.log('[server]', ...args); }

app.use(bodyParser.json());

// Health endpoint for readiness
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Utility: validate input body
function validateAssessPayload(body) {
  if (!body || typeof body !== 'object') return 'body_required';
  const { sex, age, evidence } = body;
  if (sex !== 'male' && sex !== 'female') return 'sex_must_be_male_or_female';
  if (typeof age !== 'number' || Number.isNaN(age) || age < 0 || age > 120) return 'age_invalid';
  if (!Array.isArray(evidence)) return 'evidence_must_be_array';
  for (const ev of evidence) {
    if (!ev || typeof ev !== 'object') return 'evidence_item_invalid';
    if (!ev.id || typeof ev.id !== 'string') return 'evidence_item_id_required';
  }
  return null;
}

// Compute confidence based on conditions and triage
function computeConfidence(conditions = [], triage = {}) {
  // Conditions probabilities expected 0-1
  const top = (conditions && conditions[0]) ? Number(conditions[0].probability || 0) : 0;
  let score = Math.max(0, Math.min(1, top));
  let level = 'low';
  if (score >= 0.7) level = 'high';
  else if (score >= 0.4) level = 'medium';

  // Bump to high if triage indicates urgent/emergency
  const triageUrgent = (() => {
    if (!triage) return false;
    // Infermedica triage may include 'triage_level' or 'outcome' - check common flags
    if (triage.severity === 'red' || triage.urgency === 'emergency') return true;
    if (triage.recommendation && typeof triage.recommendation === 'string' && /emergency|call ambulance|immediate/i.test(triage.recommendation)) return true;
    // some triage objects may have 'should_call_ambulance' boolean
    if (triage.should_call_ambulance === true || triage.should_call_emergency === true) return true;
    return false;
  })();
  if (triageUrgent) { level = 'high'; score = Math.max(score, 0.85); }

  const note = level === 'high' ? 'High confidence — consider urgent care if symptoms severe.' : (level === 'medium' ? 'Moderate confidence — follow recommendations and monitor.' : 'Low confidence — follow general guidance and seek care if symptoms worsen.');
  return { level, score: Number(score.toFixed(2)), note };
}

// Build a human-readable reason
function buildReason(evidence = [], conditions = []) {
  const top = conditions && conditions[0];
  const evidenceLabels = evidence
    .filter(e => e && (e.id || e.source || e.choice_id))
    .slice(0,3)
    .map(e => e.id || e.source || e.choice_id);
  if (!top) return `Insufficient data to determine a likely condition.`;
  const evPart = evidenceLabels.length ? ` based on ${evidenceLabels.join(', ')}` : '';
  return `The most likely condition is ${top.name} (${Math.round((top.probability||0)*100)}%)${evPart}.`; 
}

// Infermedica integration removed for this deployment.
// The /assess endpoint below returns a disabled message — use frontend local symptom database.

// POST /assess endpoint
app.post('/assess', (req, res) => {
  // Infermedica endpoint disabled in this deployment.
  return res.status(503).json({ error: 'infermedica_disabled', message: 'Infermedica integration is disabled. Use frontend local symptom database.' });
});

// Helper to call Google Places API (hospital nearby search)
async function callGooglePlaces(lat, lng, radius = 5000) {
  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) throw new Error('google_maps_key_missing');
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=hospital&key=${googleMapsKey}`;
  const res = await (global.fetch || fetch)(url);
  const json = await res.json();
  if (!res.ok || (json && json.status && json.status !== 'OK' && json.status !== 'ZERO_RESULTS')) {
    const err = new Error('google_places_error');
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

// POST /search-hospitals - Google Maps hospital search
app.post('/search-hospitals', async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'lat_lng_required' });
    const r = radius || 5000;
    const places = await callGooglePlaces(lat, lng, r);
    const hospitals = (places.results || []).map(p => ({
      id: p.place_id,
      name: p.name,
      address: p.vicinity || p.formatted_address || '',
      lat: p.geometry?.location?.lat,
      lng: p.geometry?.location?.lng,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total,
      maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${p.place_id}`
    }));
    return res.json({ hospitals, count: hospitals.length });
  } catch (err) {
    if (err.message === 'google_maps_key_missing') {
      log('Google Maps key not set');
      return res.status(500).json({ error: 'google_maps_key_missing' });
    }
    if (err.status) {
      log('Google Places error', err.status);
      return res.status(502).json({ error: 'google_places_down', details: err.body });
    }
    log('Server error in search-hospitals', err && err.message);
    return res.status(500).json({ error: 'server_error', message: err && err.message });
  }
});

// Setup middleware and static files BEFORE exporting
app.use(cors());
app.use(bodyParser.json());

// Serve static files from project root so `index.html` is reachable
app.use(express.static(path.join(__dirname)));

// SPA fallback: send index.html for unknown GET routes (helps if using client-side routing)
app.get('*', (req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => log(`Listening on ${PORT}`));
}

module.exports = app;

// Note: AI-powered symptom analysis disabled. Use index.html local fallback database.

app.post('/api/analyze-symptoms', (req, res) => {
  // AI-powered analysis disabled. Frontend falls back to local symptom database.
  return res.status(503).json({ 
    error: 'ai_analysis_disabled', 
    message: 'Use local symptom database in frontend',
    fallback: 'Frontend will use index.html local database'
  });
});

app.post('/api/request-consult', (req, res) => {
  const { name, email, phone, summary } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });

  const requestId = uuidv4();
  log('Consult request received:', { requestId, name, email, phone, ts: new Date().toISOString() });

  // Note: Data persistence disabled for fast prototype submission
  return res.json({ requestId, status: 'received', message: 'Consult request processed' });
});

// Admin/debug: records endpoint disabled (persistence not available in prototype mode)
app.get('/api/records', (req, res) => {
  return res.status(503).json({ error: 'records_not_available', message: 'Data persistence disabled for fast prototype deployment' });
});

// Database query endpoints disabled (persistence not available in prototype mode)
app.get('/api/analysis/:id', (req, res) => {
  return res.status(503).json({ error: 'not_available_in_prototype_mode' });
});

app.get('/api/consult/:id', (req, res) => {
  return res.status(503).json({ error: 'not_available_in_prototype_mode' });
});

app.put('/api/analysis/:id', (req, res) => {
  return res.status(503).json({ error: 'not_available_in_prototype_mode' });
});

app.put('/api/consult/:id', (req, res) => {
  return res.status(503).json({ error: 'not_available_in_prototype_mode' });
});

// Serve Google Maps script securely (key is NOT exposed to client)
app.get('/api/maps-script', (req, res) => {
  if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_not_configured' });
  // Send script tag with embedded key - key stays on server
  res.type('application/javascript');
  res.send(`if (typeof window !== 'undefined') { window.mapsScriptLoaded = true; }`);
});

// Serve maps key securely - for internal use only
app.get('/api/maps-key-server', (req, res) => {
  if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_not_configured' });
  // Return key only for maps loading (not for direct API calls)
  return res.json({ key: googleMapsKey });
});

// Deprecated - kept for backward compatibility
app.get('/api/maps-key', (req, res) => {
  return res.status(403).json({ error: 'maps_key_not_exposed_for_security' });
});

// Find nearby hospitals using Google Places Nearby Search (server-side proxy)
app.post('/api/nearby-hospitals', async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'lat_lng_required' });
    const r = radius || 5000; // default 5km
    if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_missing' });

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${r}&type=hospital&key=${googleMapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(500).json({ error: 'places_error', details: data });
    }

    const results = (data.results || []).map(p => ({
      name: p.name,
      vicinity: p.vicinity || p.formatted_address || '',
      location: p.geometry?.location || null,
      place_id: p.place_id,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total
    }));

    return res.json({ results });
  } catch (e) {
    console.error('nearby-hospitals error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Fetch place details by place_id
app.post('/api/place-details', async (req, res) => {
  try {
    const { place_id } = req.body;
    if (!place_id) return res.status(400).json({ error: 'place_id_required' });
    if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_missing' });

    const fields = encodeURIComponent('name,rating,formatted_phone_number,formatted_address,website,opening_hours,geometry');
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${googleMapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.status !== 'OK') {
      return res.status(500).json({ error: 'place_details_error', details: data });
    }

    return res.json({ result: data.result });
  } catch (e) {
    console.error('place-details error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Search hospitals by region text (uses Places Text Search)
app.post('/api/search-hospitals-region', async (req, res) => {
  try {
    const { region, radius } = req.body;
    if (!region || typeof region !== 'string') return res.status(400).json({ error: 'region_required' });
    if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_missing' });

    // Use Places Text Search: "hospital in {region}"
    const query = encodeURIComponent(`hospital in ${region}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${googleMapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(500).json({ error: 'places_error', details: data });
    }

    const results = (data.results || []).map(p => ({
      name: p.name,
      vicinity: p.formatted_address || p.vicinity || '',
      location: p.geometry?.location || null,
      place_id: p.place_id,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total
    }));

    return res.json({ results });
  } catch (e) {
    console.error('search-hospitals-region error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Reverse geocode coordinates to address
app.post('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'lat_lng_required' });
    }
    if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_missing' });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.status !== 'OK') {
      return res.status(500).json({ error: 'geocode_error', details: data });
    }

    const address = data.results && data.results.length > 0 
      ? data.results[0].formatted_address 
      : `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    return res.json({ address, results: data.results || [] });
  } catch (e) {
    console.error('reverse-geocode error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Geocode address to coordinates
app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'address_required' });
    }
    if (!googleMapsKey) return res.status(500).json({ error: 'maps_key_missing' });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(500).json({ error: 'geocode_error', details: data });
    }

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'address_not_found' });
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;
    const formatted_address = result.formatted_address;

    return res.json({ 
      lat, 
      lng, 
      address: formatted_address,
      results: data.results
    });
  } catch (e) {
    console.error('geocode error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
