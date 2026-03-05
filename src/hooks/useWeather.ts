import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/types';
import { WeatherService } from '@/services/WeatherService';
import { useAppStore } from '@/stores/appStore';

export const useWeather = (locationId: string, lat: number, lon: number) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { settings } = useAppStore();

  const fetchWeather = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await WeatherService.getCurrentWeather(locationId, lat, lon);
      setWeatherData(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching weather:', err);
    } finally {
      setIsLoading(false);
    }
  }, [locationId, lat, lon]);

  useEffect(() => {
    fetchWeather();

    // Set up auto-refresh
    const interval = setInterval(fetchWeather, settings.defaultRefreshInterval);

    return () => clearInterval(interval);
  }, [fetchWeather, settings.defaultRefreshInterval]);

  const refresh = () => {
    fetchWeather();
  };

  return {
    weatherData,
    isLoading,
    error,
    refresh,
  };
};
