import { db } from '@/db/schema';
import {
  WeatherData,
  CurrentWeather,
  ForecastDay,
  OpenWeatherMapCurrentResponse,
  OpenWeatherMapForecastResponse,
  GeocodingResult,
} from '@/types';
import { useAppStore } from '@/stores/appStore';

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Debug: Log API key status (first/last 4 chars only for security)
if (API_KEY) {
  console.log(`OpenWeatherMap API key loaded: ${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`);
} else {
  console.error('OpenWeatherMap API key is missing! Check your .env file.');
}

export class WeatherService {
  private static getApiLanguage(): 'en' | 'fr' {
    const language = useAppStore.getState().settings.language;
    return language === 'fr' ? 'fr' : 'en';
  }

  static async getCurrentWeather(
    locationId: string,
    lat: number,
    lon: number
  ): Promise<WeatherData> {
    const lang = this.getApiLanguage();

    // Check cache first
    const cached = await db.weatherData.get(locationId);
    if (
      cached &&
      cached.language === lang &&
      cached.fetchedAt &&
      Date.now() - cached.fetchedAt.getTime() < CACHE_DURATION
    ) {
      return cached;
    }

    // Fetch fresh data
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentData: OpenWeatherMapCurrentResponse = await currentResponse.json();
    const forecastData: OpenWeatherMapForecastResponse = await forecastResponse.json();

    const weatherData: WeatherData = {
      locationId,
      language: lang,
      current: this.parseCurrentWeather(currentData),
      forecast: this.parseForecast(forecastData),
      fetchedAt: new Date(),
    };

    // Update cache
    await db.weatherData.put(weatherData, locationId);

    return weatherData;
  }

  private static parseCurrentWeather(data: OpenWeatherMapCurrentResponse): CurrentWeather {
    const weather = data.weather[0];
    return {
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      weatherMain: weather.main,
      weatherDescription: weather.description,
      weatherIcon: weather.icon,
      clouds: data.clouds.all,
      visibility: data.visibility,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };
  }

  private static parseForecast(data: OpenWeatherMapForecastResponse): ForecastDay[] {
    // Group by day and get daily min/max
    const dailyData: Map<string, any[]> = new Map();

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, []);
      }
      dailyData.get(dateKey)!.push(item);
    });

    const forecast: ForecastDay[] = [];
    dailyData.forEach((items, dateKey) => {
      const temps = items.map(i => i.main.temp);
      const middleItem = items[Math.floor(items.length / 2)];

      forecast.push({
        date: new Date(dateKey),
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        weatherMain: middleItem.weather[0].main,
        weatherDescription: middleItem.weather[0].description,
        weatherIcon: middleItem.weather[0].icon,
        pop: Math.max(...items.map(i => i.pop)),
        humidity: middleItem.main.humidity,
        windSpeed: middleItem.wind.speed,
      });
    });

    return forecast.slice(0, 5); // Return 5-day forecast
  }

  static async searchLocations(query: string): Promise<GeocodingResult[]> {
    const response = await fetch(
      `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Geocoding API error:', response.status, errorText);
      if (response.status === 401) {
        throw new Error('Invalid API key (401)');
      }
      throw new Error(`Failed to search locations (${response.status})`);
    }

    return response.json();
  }

  static async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
    const response = await fetch(
      `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    const results = await response.json();
    return results[0] || null;
  }

  static getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  static convertTemp(temp: number, unit: 'celsius' | 'fahrenheit'): number {
    return unit === 'fahrenheit' ? (temp * 9) / 5 + 32 : temp;
  }

  static convertWindSpeed(speed: number, unit: 'kmh' | 'mph'): number {
    // API returns m/s
    return unit === 'mph' ? speed * 2.237 : speed * 3.6;
  }
}
