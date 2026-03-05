// Location types
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  postalCode?: string;
  webcamUrls: WebcamSource[];
  addedAt: Date;
  order: number;
}

export interface WebcamSource {
  id: string;
  url: string;
  name?: string;
  refreshInterval?: number; // in milliseconds
  lastFetched?: Date;
}

// Weather types
export interface WeatherData {
  locationId: string;
  language?: 'en' | 'fr';
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: Date;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  clouds: number;
  visibility: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastDay {
  date: Date;
  tempMin: number;
  tempMax: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  pop: number; // probability of precipitation
  humidity: number;
  windSpeed: number;
}

// Settings types
export interface AppSettings {
  language: 'en' | 'fr';
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  defaultRefreshInterval: number; // in milliseconds
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'grid' | 'list' | 'map';
  locationSortBy: LocationSortBy;
  notificationsEnabled: boolean;
  weatherAlertsEnabled: boolean;
}

// Notification types
export interface NotificationPreference {
  type: 'weather-alert' | 'webcam-update' | 'reminder';
  enabled: boolean;
  locationIds?: string[];
  conditions?: {
    minTemp?: number;
    maxTemp?: number;
    weatherTypes?: string[];
  };
  schedule?: {
    time: string; // HH:mm format
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
}

// Webcam snapshot types (for time-lapse)
export interface WebcamSnapshot {
  id: string;
  locationId: string;
  webcamSourceId: string;
  imageData: Blob;
  timestamp: Date;
}

// Time-lapse types
export interface TimelapseConfig {
  locationId: string;
  webcamSourceId: string;
  startDate: Date;
  endDate: Date;
  fps: number;
  quality: 'low' | 'medium' | 'high';
}

// View types
export type ViewMode = 'grid' | 'list' | 'map';
export type LocationSortBy = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'custom';

// API response types
export interface OpenWeatherMapCurrentResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface OpenWeatherMapForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
    pop: number;
  }>;
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
