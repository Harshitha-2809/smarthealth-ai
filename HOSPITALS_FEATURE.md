# Hospital Search Feature - Documentation

## Overview
The new hospital search feature allows users to find nearby hospitals based on their address. The feature integrates with Google Maps Geocoding API to convert addresses to coordinates and Google Places API to find hospitals near those coordinates.

## Features

### 1. **Address-Based Hospital Search**
- Users can manually enter an address or location
- System converts the address to coordinates using Google Maps Geocoding API
- Displays nearby hospitals within a 5km radius
- Shows hospitals on an interactive Google Map

### 2. **Current Location Detection**
- Users can click "📍 Use My Location" button
- System requests geolocation permission
- Automatically detects user's current coordinates
- Reverse geocodes coordinates to get address
- Auto-searches for hospitals near the location

### 3. **Hospital Details**
- Hospital name and address
- User ratings and review counts
- "Details" button - shows full hospital information (phone, hours, website, etc.)
- "Directions" button - opens Google Maps with directions

### 4. **Interactive Map**
- Visual representation of hospital locations
- User location marked with blue pin
- Hospital markers with click-to-navigate functionality
- Zoom in/out capabilities
- Center map on hospital when clicked

## Technical Implementation

### Backend Endpoints

#### 1. `/api/geocode` (POST)
Converts an address string to coordinates and formatted address.

**Request:**
```json
{
  "address": "123 Main Street, New York, NY"
}
```

**Response:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "address": "123 Main St, New York, NY 10001, USA",
  "results": [...]
}
```

#### 2. `/api/reverse-geocode` (POST)
Converts coordinates to an address.

**Request:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

**Response:**
```json
{
  "address": "123 Main St, New York, NY 10001, USA",
  "results": [...]
}
```

#### 3. `/api/nearby-hospitals` (POST)
Finds hospitals near given coordinates.

**Request:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "radius": 5000
}
```

**Response:**
```json
{
  "results": [
    {
      "name": "Hospital Name",
      "vicinity": "Address",
      "location": { "lat": 40.7128, "lng": -74.0060 },
      "place_id": "ChIJ...",
      "rating": 4.5,
      "user_ratings_total": 250
    }
  ]
}
```

### Client-Side Functions

#### Main Functions in `script.js`
- `geocodeAddress(address)` - Geocodes an address to coordinates
- `reverseGeocode(lat, lng)` - Reverse geocodes coordinates to address
- `findNearbyHospitalsFromAddress(address)` - Combines geocoding + hospital search
- `captureAddressFromGeolocation()` - Gets current location and converts to address

#### UI Functions in `index.html`
- `searchNearbyHospitalsByAddress()` - Handles address search button click
- `useCurrentLocation()` - Handles location button click
- `renderAddressHospitals(results, userLocation)` - Displays hospitals on map and list
- `showAddressSearchPanel()` - Shows the address search panel

## UI Workflow

### Step 1: View Results
After analyzing symptoms, user clicks **"🏥 Address Search"** button

### Step 2: Enter Address or Use Location
- **Manual Input**: Enter address in text field → Click "Find Hospitals"
- **Auto-Detect**: Click "📍 Use My Location" → System gets current location

### Step 3: View Results
- Left panel shows list of hospitals with ratings
- Right panel shows interactive Google Map with markers
- User can click "Details" for more info or "Directions" to navigate

## Environment Variables Required

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

The key must have these APIs enabled:
- Maps JavaScript API
- Geocoding API
- Places API

## Usage Example

```javascript
// Find hospitals near a specific address
const result = await window.findNearbyHospitalsFromAddress("123 Main St, New York, NY");
console.log(result.results); // Array of nearby hospitals
console.log(result.userLocation); // { lat, lng }

// Geocode an address
const location = await window.geocodeAddress("Boston, MA");
console.log(location); // { lat, lng, address }

// Reverse geocode coordinates
const address = await window.reverseGeocode(40.7128, -74.0060);
console.log(address); // "123 Main St, New York, NY..."

// Find hospitals near current location
const userLoc = await window.captureAddressFromGeolocation();
console.log(userLoc); // { address, lat, lng }
```

## Security Notes

- Google Maps API key is exposed to the client for geocoding operations
- Restrict API key in Google Cloud Console to prevent misuse
- Set appropriate rate limits and quotas
- Consider using API key restrictions (referrers, IP addresses)

## Browser Requirements

- Modern browser with Geolocation API support
- HTTPS required for geolocation (except localhost)
- Cookies/storage for caching maps library
- JavaScript enabled

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Maps key not configured" | Set `GOOGLE_MAPS_API_KEY` environment variable |
| "Geolocation not supported" | Use HTTPS or localhost, and ensure browser supports geolocation |
| "Address not found" | Try more specific address or use current location |
| Map not loading | Check API key has Maps JavaScript API enabled |
| No hospitals found | Increase search radius or try different location |

## Future Enhancements

- [ ] Filter hospitals by type (emergency, general, specialized)
- [ ] Filter by ratings and reviews
- [ ] Show estimated travel time by car/transit
- [ ] Integration with hospital appointment booking
- [ ] Emergency hospital priority sorting
- [ ] Multi-location search (search multiple addresses)
- [ ] Hospital bed availability information
- [ ] Doctor specialization filter within hospitals
