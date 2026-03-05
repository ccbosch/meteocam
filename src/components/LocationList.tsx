import React from 'react';
import { Location, LocationSortBy } from '@/types';
import { useWeather } from '@/hooks/useWeather';
import { useAppStore } from '@/stores/appStore';
import { WeatherService } from '@/services/WeatherService';
import { useI18n } from '@/hooks/useI18n';

interface LocationListProps {
  locations: Location[];
}

const LocationList: React.FC<LocationListProps> = ({ locations }) => {
  const { settings, updateSettings } = useAppStore();
  const { t } = useI18n();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ locationSortBy: e.target.value as LocationSortBy });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('list.sortBy')}:
        </label>
        <select
          value={settings.locationSortBy}
          onChange={handleSortChange}
          className="input w-auto"
        >
          <option value="custom">{t('list.sortCustom')}</option>
          <option value="name-asc">{t('list.sortNameAsc')}</option>
          <option value="name-desc">{t('list.sortNameDesc')}</option>
          <option value="date-desc">{t('list.sortDateDesc')}</option>
          <option value="date-asc">{t('list.sortDateAsc')}</option>
        </select>
      </div>
      
      {locations.map((location) => (
        <LocationListItem key={location.id} location={location} />
      ))}
    </div>
  );
};

const LocationListItem: React.FC<{ location: Location }> = ({ location }) => {
  const { settings } = useAppStore();
  const { t, language } = useI18n();
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
              {t('list.webcamCount', {
                count: location.webcamUrls.length,
                suffix: location.webcamUrls.length !== 1 && language === 'en' ? 's' : '',
              })}
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
            ⚠️ {t('list.weatherUnavailable')}
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
