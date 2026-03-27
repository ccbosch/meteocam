import React, { useState } from 'react';
import { Location, LocationSortBy } from '@/types';
import { useWeather } from '@/hooks/useWeather';
import { useAppStore } from '@/stores/appStore';
import { WeatherService } from '@/services/WeatherService';
import { useI18n } from '@/hooks/useI18n';

interface LocationListProps {
  locations: Location[];
  isDraggable?: boolean;
  onReorder?: (locationIds: string[]) => Promise<void>;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}

const LocationList: React.FC<LocationListProps> = ({ locations, isDraggable = false, onReorder, onEdit, onDelete }) => {
  const { settings, highlightedLocationId, updateSettings } = useAppStore();
  const { t } = useI18n();
  const [draggedLocation, setDraggedLocation] = useState<string | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<string | null>(null);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ locationSortBy: e.target.value as LocationSortBy });
  };

  const handleDragStart = (locationId: string) => {
    if (isDraggable) {
      setDraggedLocation(locationId);
    }
  };

  const handleDragOver = (e: React.DragEvent, locationId: string) => {
    e.preventDefault();
    if (draggedLocation && draggedLocation !== locationId && isDraggable) {
      setDragOverLocation(locationId);
    }
  };

  const handleDragEnd = async () => {
    if (draggedLocation && dragOverLocation && isDraggable && onReorder) {
      const newOrder = [...locations];
      const draggedIndex = newOrder.findIndex(loc => loc.id === draggedLocation);
      const dropIndex = newOrder.findIndex(loc => loc.id === dragOverLocation);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove dragged item
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        // Insert at new position
        newOrder.splice(dropIndex, 0, draggedItem);
        
        // Update order in database
        const locationIds = newOrder.map(loc => loc.id);
        await onReorder(locationIds);
      }
    }
    
    setDraggedLocation(null);
    setDragOverLocation(null);
  };

  const handleDragLeave = () => {
    setDragOverLocation(null);
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

      {isDraggable && locations.length > 1 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>{t('home.dragToReorder')}</span>
        </div>
      )}
      
      {locations.map((location) => (
        <LocationListItem 
          key={location.id} 
          location={location}
          isDraggable={isDraggable}
          isDragging={draggedLocation === location.id}
          isDragOver={dragOverLocation === location.id}
          isHighlighted={highlightedLocationId === location.id}
          onDragStart={() => handleDragStart(location.id)}
          onDragOver={(e) => handleDragOver(e, location.id)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

interface LocationListItemProps {
  location: Location;
  isDraggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  isHighlighted?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragLeave?: () => void;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}

const LocationListItem: React.FC<LocationListItemProps> = ({ 
  location,
  isDraggable = false,
  isDragging = false,
  isDragOver = false,
  isHighlighted = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
  onEdit,
  onDelete,
}) => {
  const { settings } = useAppStore();
  const { t, language } = useI18n();
  const { weatherData, isLoading, error } = useWeather(
    location.id,
    location.latitude,
    location.longitude
  );

  return (
    <div 
      className={`card p-4 transition-all ${
        isDragging ? 'opacity-40 scale-95' : ''
      } ${
        isDragOver ? 'ring-4 ring-primary-500 scale-[1.02]' : ''
      } ${
        isHighlighted ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-lg' : ''
      } ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      draggable={isDraggable}
      onDragStart={(e) => {
        if (isDraggable && onDragStart) {
          e.stopPropagation();
          onDragStart();
        }
      }}
      onDragOver={(e) => {
        if (isDraggable && onDragOver) {
          onDragOver(e);
        }
      }}
      onDragEnd={(e) => {
        if (isDraggable && onDragEnd) {
          e.stopPropagation();
          onDragEnd();
        }
      }}
      onDragLeave={() => {
        if (isDraggable && onDragLeave) {
          onDragLeave();
        }
      }}
    >
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

        <div className="flex items-center space-x-1 ml-2">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(location); }}
              className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (globalThis.confirm(`Delete "${location.name}"?`)) {
                  onDelete(location);
                }
              }}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationList;
