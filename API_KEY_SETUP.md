# 🔑 API Key Setup - Quick Reference

## Step 1: Get Your API Key

### From Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/Select a project
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (Nearby Search)
4. Go to **Credentials** → Create **API Key**
5. Copy the key

## Step 2: Add to `.env`

Create or edit `.env` file in your project root:

```
GOOGLE_MAPS_API_KEY=your_actual_key_here_1234567890ABC
PORT=3000
```

**Important:** Never commit `.env` to git!

Ensure `.gitignore` has:
```
.env
.env.local
```

## Step 3: Run Server

```bash
npm start
```

The server will automatically:
- Read the key from `.env`
- Use it for all API calls
- Keep it secure from browsers
- Return only necessary data to frontend

## Step 4: Test It Works

### Test Address Search:
1. Open http://localhost:3000
2. Complete symptom analysis
3. Click "🏥 Address Search"
4. Enter address (e.g., "New York, NY")
5. Click "Find Hospitals"
6. ✅ Should see hospitals on map!

### Verify Security:
1. Open DevTools (F12)
2. Go to Network tab
3. Look at `/api/` requests
4. ✅ NO raw API key should be visible!

## Troubleshooting

### "Maps key not configured"
→ Add `GOOGLE_MAPS_API_KEY=...` to `.env`

### "Maps key missing"
→ Restart server after adding `.env`

### Map doesn't load
→ Check API key has "Maps JavaScript API" enabled

### No hospitals found
→ Try different address or check API quota

### Error in browser console
→ Check Network tab for actual API error
→ Verify API key is correct

---

## Security Tips

✅ **DO:**
- Keep `.env` in `.gitignore`
- Use different keys for dev/production
- Rotate keys regularly
- Monitor API usage in Google Cloud Console

❌ **DON'T:**
- Share `.env` file
- Commit `.env` to git
- Paste key in chats or emails
- Use same key across projects

---

## How It Works (Behind the Scenes)

```
Your Browser
    ↓
    POST /api/geocode (address)
    ↓
Your Server
    ↓
    Uses googleMapsKey from .env
    ↓
    Google Maps API
    ↓
    Response sent back to browser
    ↓
Your Browser (key never seen!)
```

---

## Available Endpoints (Use Internally)

All these keep your key secure:

- `POST /api/geocode` - Address to coordinates
- `POST /api/reverse-geocode` - Coordinates to address  
- `POST /api/nearby-hospitals` - Find hospitals
- `POST /api/place-details` - Hospital details
- `POST /api/search-hospitals-region` - Regional search
- `GET /api/maps-key-server` - Maps library key (internal)

---

## Need Help?

Check these files:
- **SECURITY_IMPLEMENTATION.md** - How security works
- **HOSPITALS_FEATURE.md** - Feature documentation
- **IMPLEMENTATION_NOTES.md** - Technical details
- **README.md** - Project overview

---

That's it! Your API key is secure and ready to use. 🔐
