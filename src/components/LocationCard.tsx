import React, { useState } from 'react';
import { Location } from '@/types';
import { useWeather } from '@/hooks/useWeather';
import { useWebcam } from '@/hooks/useWebcam';
import { useAppStore } from '@/stores/appStore';
import { WeatherService } from '@/services/WeatherService';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

interface LocationCardProps {
  location: Location;
  onEdit?: (location: Location) => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragLeave?: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  onEdit,
  isDraggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragLeave,
}) => {
  const { settings } = useAppStore();
  const { t } = useI18n();
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useWeather(
    location.id,
    location.latitude,
    location.longitude
  );
  
  const [currentWebcamIndex, setCurrentWebcamIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentWebcam = location.webcamUrls[currentWebcamIndex];
  
  const { imageUrl, isLoading: webcamLoading, error: webcamError } = useWebcam(
    currentWebcam?.url || '',
    currentWebcam?.refreshInterval || settings.defaultRefreshInterval
  );

  const nextWebcam = () => {
    setCurrentWebcamIndex((prev) => (prev + 1) % location.webcamUrls.length);
  };

  const prevWebcam = () => {
    setCurrentWebcamIndex(
      (prev) => (prev - 1 + location.webcamUrls.length) % location.webcamUrls.length
    );
  };

  const handleCardClick = () => {
    setIsFullscreen(true);
  };

  const renderCardContent = (fullscreenMode = false) => (
    <>
      {/* Webcam Section */}
      <div
        className={`relative bg-gray-200 dark:bg-gray-700 ${
          fullscreenMode ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-video'
        }`}
      >
        {webcamLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
        
        {webcamError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">{t('location.webcamUnavailable')}</p>
            </div>
          </div>
        )}
        
        {imageUrl && !webcamLoading && (
          <img
            src={imageUrl}
            alt={`Webcam view of ${location.name}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Webcam Navigation */}
        {location.webcamUrls.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevWebcam();
              }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextWebcam();
              }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Webcam indicator */}
        {location.webcamUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {location.webcamUrls.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentWebcamIndex
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Location Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold">{location.name}</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen((prev) => !prev);
              }}
              className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              title={isFullscreen ? t('card.exitFullscreen') : t('card.fullscreen')}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4H4m11 0h5v5m0 6v5h-5m-6 0H4v-5"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4h4m8 0h4v4m0 8v4h-4m-8 0H4v-4"
                  />
                </svg>
              )}
            </button>

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(location);
                }}
                className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title={t('header.editLocation')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Weather Section */}
        {weatherLoading && (
          <div className="flex items-center space-x-2">
            <div className="skeleton w-16 h-16"></div>
            <div className="flex-1">
              <div className="skeleton w-24 h-6 mb-2"></div>
              <div className="skeleton w-32 h-4"></div>
            </div>
          </div>
        )}

        {weatherError && !weatherLoading && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ {t('location.weatherUnavailable')}
            </p>
          </div>
        )}

        {weatherData && !weatherLoading && (
          <div className="flex items-center space-x-3">
            <img
              src={WeatherService.getWeatherIconUrl(weatherData.current.weatherIcon)}
              alt={weatherData.current.weatherDescription}
              className="w-16 h-16"
            />
            <div>
              <div className="text-3xl font-bold">
                {Math.round(
                  WeatherService.convertTemp(
                    weatherData.current.temp,
                    settings.temperatureUnit
                  )
                )}
                °{settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {weatherData.current.weatherDescription}
              </div>
            </div>
          </div>
        )}

        {/* Weather Details */}
        {weatherData && (
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">💧</span>
              <span>{weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">💨</span>
              <span>
                {Math.round(
                  WeatherService.convertWindSpeed(
                    weatherData.current.windSpeed,
                    settings.windSpeedUnit
                  )
                )}{' '}
                {settings.windSpeedUnit}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card overflow-hidden cursor-pointer transition-all ${
          isDragging ? 'opacity-40 scale-95' : ''
        } ${
          isDragOver ? 'ring-4 ring-primary-500 scale-105' : ''
        } ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onClick={handleCardClick}
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
        {renderCardContent(false)}
      </motion.div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => setIsFullscreen(false)}
            />
            <div
              className="relative h-full overflow-y-auto p-4 md:p-8"
              onClick={() => setIsFullscreen(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="mx-auto w-full max-w-6xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="card overflow-hidden shadow-2xl">
                  {renderCardContent(true)}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationCard;
