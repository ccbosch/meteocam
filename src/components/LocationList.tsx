import React from 'react';
import { Location } from '@/types';
import { useWeather } from '@/hooks/useWeather';
import { useAppStore } from '@/stores/appStore';
import { WeatherService } from '@/services/WeatherService';

interface LocationListProps {
  locations: Location[];
}

const LocationList: React.FC<LocationListProps> = ({ locations }) => {
  return (
    <div className="space-y-4">
      {locations.map((location) => (
        <LocationListItem key={location.id} location={location} />
      ))}
    </div>
  );
};

const LocationListItem: React.FC<{ location: Location }> = ({ location }) => {
  const { settings } = useAppStore();
  const { weatherData, isLoading, error } = useWeather(
    location.id,
    location.latitude,
    location.longitude
  );

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="text-2xl">📍</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{location.name}</h3>
            <p className="text-sm text-gray-500">
              {location.webcamUrls.length} webcam{location.webcamUrls.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="skeleton w-12 h-12"></div>
            <div className="skeleton w-20 h-8"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚠️ Weather unavailable
          </div>
        )}

        {weatherData && !isLoading && (
          <div className="flex items-center space-x-3">
            <img
              src={WeatherService.getWeatherIconUrl(weatherData.current.weatherIcon)}
              alt={weatherData.current.weatherDescription}
              className="w-12 h-12"
            />
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round(
                  WeatherService.convertTemp(
                    weatherData.current.temp,
                    settings.temperatureUnit
                  )
                )}
                °{settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {weatherData.current.weatherDescription}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationList;
