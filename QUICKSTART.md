# Quick Start Guide: Hospital Address Search Feature

## 🚀 Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing one)
3. Enable these APIs:
   - **Maps JavaScript API** (Maps on web)
   - **Geocoding API** (Convert address ↔ coordinates)
   - **Places API** (Find hospitals)
4. Go to "Credentials" and create an **API Key**
5. Copy the API key

### Step 2: Configure Environment

Create or update `.env` file in project root:
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
PORT=3000
```

### Step 3: Run the Application

```bash
npm install
npm start
```

Visit: `http://localhost:3000`

## 📍 How to Use the Feature

### Method 1: Search by Address
1. Complete the symptom analysis (Steps 1-3)
2. Click **"🏥 Address Search"** button
3. Enter your address (e.g., "New York, NY" or "123 Main St, Boston, MA")
4. Click **"Find Hospitals"**
5. View results on the map and list

### Method 2: Use Current Location
1. Complete the symptom analysis (Steps 1-3)
2. Click **"🏥 Address Search"** button
3. Click **"📍 Use My Location"** button
4. Allow location permission when prompted
5. Hospitals will load automatically

### Method 3: GPS-Based Search
1. Complete the symptom analysis (Steps 1-3)
2. Click **"🗺️ GPS Hospitals"** button
3. Allow location permission when prompted
4. Hospitals will load automatically

## 🗺️ What You'll See

### Hospital List (Left Panel)
- Hospital name
- Address with 📍 icon
- Star rating and review count
- **Details** button - Show phone, hours, website
- **Directions** button - Open in Google Maps

### Interactive Map (Right Panel)
- 🔵 Blue pin = Your location
- 🔴 Red pins = Hospitals
- Click any hospital to center map
- Zoom in/out to explore

## 🔧 Available Endpoints

### For Developers

**Find hospitals by address:**
```javascript
const result = await window.findNearbyHospitalsFromAddress("New York, NY");
// Returns: { results: [...hospitals], userLocation: {lat, lng} }
```

**Geocode an address:**
```javascript
const location = await window.geocodeAddress("Boston, MA");
// Returns: { lat, lng, address }
```

**Reverse geocode coordinates:**
```javascript
const address = await window.reverseGeocode(40.7128, -74.0060);
// Returns: "123 Main St, New York, NY..."
```

**Get current location:**
```javascript
const location = await window.captureAddressFromGeolocation();
// Returns: { address, lat, lng }
```

## 🔐 Security Tips

- **Keep API key private!** Never commit `.env` to git
- Use `.gitignore` to exclude `.env`:
  ```bash
  echo ".env" >> .gitignore
  ```
- Restrict API key in Google Cloud Console:
  - Set referrer restrictions
  - Enable only needed APIs
  - Set usage limits/quotas

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Maps key not configured" | Add `GOOGLE_MAPS_API_KEY` to `.env` |
| "Geolocation not supported" | Use HTTPS (or localhost for development) |
| "Address not found" | Try more specific address or use current location |
| "No hospitals found" | Address may be too remote, try nearby city |
| Map blank/white | Check API key has Maps JavaScript API enabled |

## 📚 Documentation Files

- [HOSPITALS_FEATURE.md](./HOSPITALS_FEATURE.md) - Complete feature documentation
- [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) - Technical implementation details
- [README.md](./README.md) - Main project README

## 🎯 Features at a Glance

✅ **Address-based hospital search**  
✅ **Current location auto-detection**  
✅ **Interactive Google Map display**  
✅ **Hospital details (ratings, phone, hours)**  
✅ **Google Maps directions integration**  
✅ **Responsive UI**  
✅ **Error handling & user feedback**  
✅ **5km default search radius**  

## 💡 Pro Tips

1. **Be specific with addresses** - "New York" works, but "123 Broadway, New York, NY 10001" is better
2. **Check hospital hours** - Use "Details" button to verify before visiting
3. **Use directions** - Click "Directions" for navigation and travel time estimates
4. **Mobile friendly** - Works on phones! Geolocation is most useful on mobile
5. **Multi-language** - Google Maps works in your local language

## 🚨 Emergency Note

For genuine medical emergencies:
- **Call emergency services** (911 in US, 999 in UK, etc.)
- Don't rely solely on app for emergencies
- Always call ahead if possible

## Need Help?

Check the error messages for specific guidance - they'll tell you:
- What went wrong
- How to fix it
- What information is missing

Good luck! 🏥
