# MeteoCam - Webcams & Weather PWA

A Progressive Web App (PWA) for viewing webcams and weather forecasts from your favorite locations.

## Features

- 📷 **Multiple Webcams** - Add and view multiple webcam feeds per location
- 🌤️ **Weather Forecasts** - Real-time weather data and 5-day forecasts
- 🗺️ **Multiple Views** - Grid, List, and Map views
- 💾 **Offline Support** - Works offline with cached data
- 📱 **Progressive Web App** - Install on any device
- 🔔 **Push Notifications** - Weather alerts (coming soon)
- ⏱️ **Time-lapse** - Capture and view webcam time-lapses (coming soon)
- 🔄 **Auto-refresh** - Configurable refresh intervals
- 🌓 **Dark Mode** - Light, dark, and auto theme support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenWeatherMap API key (free tier available)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and add your OpenWeatherMap API key:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your API key:
   ```
   VITE_OPENWEATHERMAP_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Add a Location**: Click "Add Location" and search for a city
2. **Add Webcam URLs**: Enter direct image URLs from public webcams
3. **View Data**: Switch between Grid, List, and Map views
4. **Configure Settings**: Adjust units, refresh intervals, and theme

## Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Dexie.js** - IndexedDB wrapper
- **Zustand** - State management
- **Leaflet** - Map view
- **Framer Motion** - Animations
- **Workbox** - PWA service worker

## API

The app uses the **OpenWeatherMap API** for:
- Current weather data
- 5-day forecasts
- Location geocoding

Get your free API key at [OpenWeatherMap](https://openweathermap.org/api)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
