// Client-side helper functions for calling the API endpoints
// The main UI uses inline script in `index.html`. This file provides optional helpers
// if you prefer to move client logic into an external file.

async function apiAnalyzeSymptoms(text, severity) {
  const res = await fetch('/api/analyze-symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, severity })
  });
  if (!res.ok) throw new Error('Analyze request failed');
  return res.json();
}

async function apiRequestConsult({ name, email, phone, summary }) {
  const res = await fetch('/api/request-consult', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, summary })
  });
  if (!res.ok) throw new Error('Consult request failed');
  return res.json();
}

// Expose to global for inline scripts in HTML to call
window.apiAnalyzeSymptoms = apiAnalyzeSymptoms;
window.apiRequestConsult = apiRequestConsult;

// Google Maps + Places helpers (client)
async function getMapsKey() {
  const res = await fetch('/api/maps-key');
  if (!res.ok) throw new Error('Maps key not available');
  const j = await res.json();
  return j.key;
}

async function findNearbyHospitals(lat, lng, radius = 5000) {
  const res = await fetch('/api/nearby-hospitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, radius })
  });
  if (!res.ok) throw new Error('Nearby hospitals request failed');
  return res.json();
}

async function findHospitalsByRegion(region, radius) {
  const res = await fetch('/api/search-hospitals-region', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ region, radius })
  });
  if (!res.ok) throw new Error('Region search failed');
  return res.json();
}

window.findHospitalsByRegion = findHospitalsByRegion;

// Find nearby doctors using Google Places
async function findNearbyDoctors(lat, lng, radius = 5000, type = 'doctor') {
  const res = await fetch('/search-doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, radius, type })
  });
  if (!res.ok) throw new Error('Doctor search failed');
  return res.json();
}

window.findNearbyDoctors = findNearbyDoctors;

async function getPlaceDetails(place_id) {
  const res = await fetch('/api/place-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ place_id })
  });
  if (!res.ok) throw new Error('Place details request failed');
  return res.json();
}

// Address capture and geocoding
async function captureAddressFromGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          resolve({ address, lat: latitude, lng: longitude });
        } catch (err) {
          resolve({ address: `Latitude: ${latitude}, Longitude: ${longitude}`, lat: latitude, lng: longitude });
        }
      },
      (err) => reject(err)
    );
  });
}

// Reverse geocode coordinates to address (server-side proxy - key stays secure)
async function reverseGeocode(lat, lng) {
  const res = await fetch('/api/reverse-geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  });
  if (!res.ok) throw new Error('Reverse geocode failed');
  const data = await res.json();
  return data.address || `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Geocode address string to coordinates (server-side proxy - key stays secure)
async function geocodeAddress(address) {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  if (!res.ok) throw new Error('Geocode failed');
  const data = await res.json();
  if (data.lat && data.lng) {
    return { lat: data.lat, lng: data.lng, address: data.address };
  }
  throw new Error('Address not found');
}

// Search nearby hospitals from captured address
async function findNearbyHospitalsFromAddress(address) {
  try {
    const { lat, lng } = await geocodeAddress(address);
    const res = await findNearbyHospitals(lat, lng, 5000);
    return { ...res, userLocation: { lat, lng } };
  } catch (err) {
    throw err;
  }
}

window.getMapsKey = getMapsKey;
window.findNearbyHospitals = findNearbyHospitals;
window.getPlaceDetails = getPlaceDetails;
window.captureAddressFromGeolocation = captureAddressFromGeolocation;
window.geocodeAddress = geocodeAddress;
window.findNearbyHospitalsFromAddress = findNearbyHospitalsFromAddress;
window.reverseGeocode = reverseGeocode;
