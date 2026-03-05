# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Your API Key (2 minutes)

**Required: OpenWeatherMap API (for weather data)**
1. Visit https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Go to API Keys section
4. Copy your API key

**Optional: Windy API (for automatic webcam discovery)**
1. Visit https://api.windy.com/keys
2. Register for a free API key
3. This enables automatic discovery of 15,000+ webcams worldwide
4. Without it, you'll still get helpful search suggestions

### Step 2: Configure the App (1 minute)
1. Open `.env` file in the project root
2. Replace `your_api_key_here` with your actual OpenWeatherMap API key:
   ```
   VITE_OPENWEATHERMAP_API_KEY=your_real_api_key_here
   ```
3. **(Optional)** Add your Windy API key for automatic webcam discovery:
   ```
   VITE_WINDY_API_KEY=your_windy_api_key_here
   ```
4. Save the file
5. Restart the dev server if it's running

### Step 3: Add Your First Location (2 minutes)

**Option 1: Search by City Name (Requires API Key)**
1. Click **"Add Your First Location"**
2. Click **"🔍 Search City"** tab
3. Search for a city (try "Tokyo" or "Paris")
4. Click on a result
5. **Automatic webcam search begins** - found webcams appear automatically! 📷
6. Click "+ Add" on any webcams you want, or enter URLs manually
7. Click **"Add Location"**

**Option 2: Use Map Picker (No API Key Needed)**
1. Click **"Add Your First Location"**
2. Click **"🗺️ Map Picker"** tab
3. Enter a location name
4. Click on the map to select coordinates
5. Zoom and pan to find exact location
6. Click **"Continue to Webcams"**
7. **Automatic webcam search begins** - found webcams appear! 📷
8. Add webcam URLs (use found ones or enter manually)
9. Click **"Add Location"**

**Option 3: Manual Coordinates (No API Key Needed)**
1. Click **"Add Your First Location"**
2. Click **"📍 Manual Entry"** tab
3. Enter location name and coordinates
4. Click **"Continue to Webcams"**
5. **Automatic webcam search begins** - found webcams appear! 📷
6. Add webcam URLs (use found ones or enter manually)
7. Click **"Add Location"**

## 📷 Finding Webcam URLs

### 🎯 Automatic Webcam Discovery (NEW!)

When you select a location, MeteoCam automatically searches for nearby webcams:

1. **Select any location** using Search, Map Picker, or Manual Entry
2. **Wait a moment** - the app searches for webcams near your location
3. **Click "+ Add"** on any found webcams to instantly add them
4. **No webcams found?** Use the suggested Google search terms to find webcams manually

**Optional: Enable more webcam sources**
- Get a free API key from https://api.windy.com/keys
- Add to `.env`: `VITE_WINDY_API_KEY=your_key_here`
- Restart dev server to enable Windy Webcams database (15,000+ webcams worldwide)

### Example Webcams to Try

Here are some public webcam URLs you can use for testing:

**Tokyo, Japan:**
```
https://www.example.com/webcam.jpg
```

**Tips for Finding Webcams:**
1. Search Google for "[city name] webcam live"
2. Look for traffic cameras, tourism sites, ski resorts
3. Right-click on the webcam image and "Copy image address"
4. The URL should end in `.jpg`, `.jpeg`, or `.png`

### How to Extract Webcam URL from a Website

1. Open the webcam website
2. Press F12 to open Developer Tools
3. Go to the **Network** tab
4. Refresh the page
5. Type "jpg" or "jpeg" in the filter
6. Find the image that's updating (the webcam feed)
7. Right-click the request > Copy > Copy URL
8. Paste this URL into MeteoCam

## 🎯 Common Webcam Sources

- **Traffic Cameras**: City DOT websites often have public feeds
- **Ski Resorts**: Usually have mountain webcams
- **Beaches**: Tourism boards often provide beach cams
- **Airports**: Runway and terminal webcams
- **City Views**: Tourism sites for major landmarks
- **Weather Stations**: Local weather service webcams

## ⚙️ Using the App

### Views
- **Grid View** (⊞): Large cards with webcam images
- **List View** (☰): Compact list, great for many locations  
- **Map View** (🗺️): See all locations on an interactive map

### Settings
Click the ⚙️ icon to configure:
- Temperature units (°C or °F)
- Wind speed (km/h or mph)
- Refresh interval (how often to update)
- Theme (light/dark/auto)
- Default view

### Auto-Refresh
- Weather updates every 30 minutes (API limit)
- Webcams refresh based on your setting (default: 15 min)
- Manual refresh by clicking the refresh icon

## 🔧 Troubleshooting

### "Failed to fetch weather data" or "API Key Issues"
- ✅ **Use Map Picker or Manual Entry** - You can still add locations and view webcams!
- ✅ Check your API key is correct in `.env`
- ✅ Restart the dev server after changing `.env`
- ✅ Wait 10-60 minutes for new API keys to activate (OpenWeatherMap requirement)
- ✅ Verify you have internet connection
- ✅ Check OpenWeatherMap API status

### "Map not loading in Map Picker"
- ⚠️ Check your internet connection (map tiles from OpenStreetMap)
- ⚠️ Refresh the page and try again
- ⚠️ Try switching to Manual Entry mode as alternative

### "Webcam unavailable"
- ⚠️ The URL may be incorrect
- ⚠️ CORS policy may block the image
- ⚠️ The webcam may be offline
- ⚠️ Try a different webcam URL

### Webcam Shows Old Image
- Images are cached for performance
- Wait for the auto-refresh interval
- Or click refresh to update immediately

## 💡 Pro Tips

1. **Use Automatic Webcam Discovery**: After selecting a location, wait for the automatic search - it often finds great webcams instantly!
2. **Get Windy API Key**: Enable access to 15,000+ webcams worldwide with a free Windy API key
3. **Use Map Picker for Exact Locations**: The map picker is great for specific spots like your home, office, or a favorite viewpoint
4. **Test Webcam URLs First**: Open the URL in a new browser tab to verify it loads
5. **Name Your Webcams**: Give descriptive names like "City Center" or "Beach View"
6. **Multiple Webcams**: Add several webcams per location for different angles
7. **Bookmark Locations**: Use Grid view to see all your locations at once
8. **Install as App**: Click the install prompt to add to your home screen
9. **No API Key? No Problem**: Use Map Picker or Manual Entry to add locations without waiting for API activation

## 📱 Installing as PWA

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install MeteoCam"
3. The app opens in its own window

### Mobile (Android)
1. Tap the menu (⋮)
2. Select "Add to Home screen"
3. Confirm installation

### Mobile (iOS/Safari)
1. Tap the Share button
2. Scroll and tap "Add to Home Screen"
3. Tap "Add"

## 🌐 OpenWeatherMap API Limits

**Free Tier:**
- 1,000 calls per day
- 60 calls per minute

**Your Usage:**
- Weather updates every 30 minutes
- 10 locations = ~480 calls per day ✅
- 20 locations = ~960 calls per day ✅
- Stay under 25 locations to be safe

## 🎨 UI Features

- **Dark Mode**: Automatically matches your system preference
- **Responsive**: Works on phone, tablet, and desktop
- **Offline**: Works without internet after first load
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Next Steps

1. Add 3-5 of your favorite locations
2. Test the different views (Grid/List/Map)
3. Configure your preferred settings
4. Install as a PWA for quick access
5. Share your favorite locations with friends (coming soon!)

---

Need help? Check `IMPLEMENTATION.md` for detailed documentation or `README.md` for technical details.
