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
  onLocationNameClick?: (location: Location) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onLocationNameClick }) => {
  const { settings } = useAppStore();
  const { t } = useI18n();
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useWeather(
    location.id,
    location.latitude,
    location.longitude
  );
  
  const [currentWebcamIndex, setCurrentWebcamIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState<number>(0);
  const weatherProviders = [
    {
      id: 'openweathermap',
      name: 'OpenWeatherMap',
      url: (lat: number, lon: number) =>
        `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${lat}&lon=${lon}&zoom=8`,
    },
    {
      id: 'meteofrance',
      name: 'Météo-France',
      url: (_lat: number, _lon: number) =>
        location.postalCode
          ? `https://meteofrance.com/previsions-meteo-france/${encodeURIComponent(location.name.toLowerCase().replace(/\s+/g, '-'))}/${location.postalCode}`
          : `https://meteofrance.com/previsions-meteo-france/${encodeURIComponent(location.name.toLowerCase().replace(/\s+/g, '-'))}`,
    },
    {
      id: 'windy',
      name: 'Windy',
      url: (lat: number, lon: number) =>
        `https://www.windy.com/${lat.toFixed(3)}/${lon.toFixed(3)}?${lat.toFixed(3)},${lon.toFixed(3)},10`,
    },
    {
      id: 'wunderground',
      name: 'Weather Underground',
      url: (lat: number, lon: number) =>
        `https://www.wunderground.com/weather/${lat.toFixed(3)},${lon.toFixed(3)}`,
    },
    {
      id: 'ventusky',
      name: 'Ventusky',
      url: (lat: number, lon: number) =>
        `https://www.ventusky.com/?p=${lat.toFixed(3)};${lon.toFixed(3)};8&l=temperature`,
    },
  ];
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

  // Touch gesture handlers for swipe
  const minSwipeDistance = 50; // Minimum distance for a swipe

  const onTouchStart = (e: React.TouchEvent) => {
    if (location.webcamUrls.length <= 1) return;
    setTouchEnd(null);
    setSwipeDistance(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (location.webcamUrls.length <= 1) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    if (touchStart !== null) {
      setSwipeDistance(touchStart - currentTouch);
    }
  };

  const onTouchEnd = () => {
    if (location.webcamUrls.length <= 1) return;
    if (!touchStart || !touchEnd) {
      setSwipeDistance(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextWebcam();
    } else if (isRightSwipe) {
      prevWebcam();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeDistance(0);
  };

  const renderCardContent = (fullscreenMode = false) => (
    <>
      {/* Webcam Section */}
      <div
        className={`relative bg-gray-200 dark:bg-gray-700 ${
          fullscreenMode ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-video'
        } ${location.webcamUrls.length > 1 ? 'touch-pan-y' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
          <>
            <img
              src={imageUrl}
              alt={`Webcam view of ${location.name}`}
              className="w-full h-full object-cover"
              style={{
                transform: swipeDistance !== 0 ? `translateX(${-swipeDistance * 0.3}px)` : 'none',
                transition: swipeDistance === 0 ? 'transform 0.3s ease-out' : 'none',
              }}
            />
            {/* Swipe visual feedback */}
            {location.webcamUrls.length > 1 && Math.abs(swipeDistance) > 10 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`bg-black bg-opacity-50 rounded-full p-4 ${
                  Math.abs(swipeDistance) > 50 ? 'scale-110' : 'scale-100'
                } transition-transform`}>
                  <svg 
                    className="w-12 h-12 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      transform: swipeDistance < 0 ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}
          </>
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
          <h3 
            className="text-xl font-semibold cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            onClick={() => onLocationNameClick?.(location)}
          >
            {location.name}
          </h3>
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
        className="card overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        {renderCardContent(false)}
      </motion.div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => setIsFullscreen(false)}
            />
            <div
              className="relative h-full overflow-y-auto p-4 md:p-8 flex flex-col"
              onClick={() => setIsFullscreen(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="mx-auto w-full max-w-6xl flex flex-col h-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fullscreen Layout: Webcam on top, Weather forecast on bottom */}
                <div className="card overflow-hidden shadow-2xl flex flex-col max-h-full">
                  {/* Webcam Section - Top (Reduced Height) */}
                  <div className="relative bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <div
                      className="relative bg-gray-200 dark:bg-gray-700 w-full touch-pan-y min-h-40"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
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
                        <>
                          <img
                            src={imageUrl}
                            alt={`Webcam view of ${location.name}`}
                            className="w-full h-auto block max-h-64 md:max-h-80 object-contain"
                            style={{
                              transform: swipeDistance !== 0 ? `translateX(${-swipeDistance * 0.3}px)` : 'none',
                              transition: swipeDistance === 0 ? 'transform 0.3s ease-out' : 'none',
                            }}
                          />
                          {/* Swipe visual feedback */}
                          {location.webcamUrls.length > 1 && Math.abs(swipeDistance) > 10 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className={`bg-black bg-opacity-50 rounded-full p-4 ${
                                Math.abs(swipeDistance) > 50 ? 'scale-110' : 'scale-100'
                              } transition-transform`}>
                                <svg 
                                  className="w-12 h-12 text-white" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                  style={{
                                    transform: swipeDistance < 0 ? 'rotate(180deg)' : 'none',
                                  }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </>
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

                      {/* Close and Edit buttons - Top right */}
                      <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFullscreen(false);
                          }}
                          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                          title={t('card.exitFullscreen')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(location);
                            }}
                            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
                            title={t('header.editLocation')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weather Forecast Section - Bottom */}
                  <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-y-auto flex-1">
                    <div className="p-4 md:p-6">
                      {/* Location Title and Weather Provider Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <h3 className="text-xl font-semibold">{location.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {weatherProviders.map((provider) => (
                            <a
                              key={provider.id}
                              href={provider.url(location.latitude, location.longitude)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors bg-gray-50 dark:bg-gray-700"
                            >
                              {provider.name} ↗
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Current Weather */}
                      {weatherLoading && (
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="skeleton w-20 h-20"></div>
                          <div className="flex-1">
                            <div className="skeleton w-24 h-8 mb-2"></div>
                            <div className="skeleton w-32 h-4"></div>
                          </div>
                        </div>
                      )}

                      {weatherError && !weatherLoading && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⚠️ {t('location.weatherUnavailable')}
                          </p>
                        </div>
                      )}

                      {weatherData && !weatherLoading && (
                        <>
                          {/* Current Weather Summary + Details */}
                          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-start gap-4">
                              {/* Left: icon + temp + description */}
                              <div className="flex items-start space-x-3 flex-shrink-0">
                                <img
                                  src={WeatherService.getWeatherIconUrl(weatherData.current.weatherIcon)}
                                  alt={weatherData.current.weatherDescription}
                                  className="w-16 h-16"
                                />
                                <div>
                                  <div className="text-4xl font-bold">
                                    {Math.round(
                                      WeatherService.convertTemp(
                                        weatherData.current.temp,
                                        settings.temperatureUnit
                                      )
                                    )}
                                    °{settings.temperatureUnit === 'celsius' ? 'C' : 'F'}
                                  </div>
                                  <div className="text-base text-gray-600 dark:text-gray-400 capitalize">
                                    {weatherData.current.weatherDescription}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('location.feelsLike')} {Math.round(
                                      WeatherService.convertTemp(
                                        weatherData.current.feelsLike,
                                        settings.temperatureUnit
                                      )
                                    )}°
                                  </div>
                                </div>
                              </div>

                              {/* Right: 4 stats — only on md+ */}
                              <div className="hidden md:flex flex-1 items-center justify-around ml-4 border-l border-gray-200 dark:border-gray-600 pl-4">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-0.5">💧 {t('location.humidity')}</div>
                                  <div className="text-sm font-semibold">{weatherData.current.humidity}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-0.5">💨 {t('location.windSpeed')}</div>
                                  <div className="text-sm font-semibold">
                                    {Math.round(WeatherService.convertWindSpeed(weatherData.current.windSpeed, settings.windSpeedUnit))}{' '}{settings.windSpeedUnit}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-0.5">🌡️ {t('location.pressure')}</div>
                                  <div className="text-sm font-semibold">{weatherData.current.pressure} hPa</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-0.5">👁️ {t('location.visibility')}</div>
                                  <div className="text-sm font-semibold">{Math.round(weatherData.current.visibility / 1000)} km</div>
                                </div>
                              </div>
                            </div>

                            {/* 4 stats on new line — only on mobile */}
                            <div className="flex md:hidden justify-around mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-0.5">💧 {t('location.humidity')}</div>
                                <div className="text-sm font-semibold">{weatherData.current.humidity}%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-0.5">💨 {t('location.windSpeed')}</div>
                                <div className="text-sm font-semibold">
                                  {Math.round(WeatherService.convertWindSpeed(weatherData.current.windSpeed, settings.windSpeedUnit))}{' '}{settings.windSpeedUnit}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-0.5">🌡️ {t('location.pressure')}</div>
                                <div className="text-sm font-semibold">{weatherData.current.pressure} hPa</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-0.5">👁️ {t('location.visibility')}</div>
                                <div className="text-sm font-semibold">{Math.round(weatherData.current.visibility / 1000)} km</div>
                              </div>
                            </div>
                          </div>

                          {/* 4-Day Forecast */}
                          <div>
                            <h4 className="text-lg font-semibold mb-4">{t('location.forecast')}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {weatherData.forecast.slice(1, 5).map((day, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                                >
                                  <div className="text-sm font-semibold mb-3">
                                    {new Date(day.date).toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : 'en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </div>
                                  <img
                                    src={WeatherService.getWeatherIconUrl(day.weatherIcon)}
                                    alt={day.weatherDescription}
                                    className="w-12 h-12 mx-auto mb-2"
                                  />
                                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mb-2">
                                    {day.weatherDescription}
                                  </div>
                                  <div className="flex justify-center space-x-2 mb-3">
                                    <div className="text-lg font-bold">
                                      {Math.round(
                                        WeatherService.convertTemp(
                                          day.tempMax,
                                          settings.temperatureUnit
                                        )
                                      )}°
                                    </div>
                                    <div className="text-lg text-gray-500">
                                      {Math.round(
                                        WeatherService.convertTemp(
                                          day.tempMin,
                                          settings.temperatureUnit
                                        )
                                      )}°
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <div>💧 {day.humidity}%</div>
                                    <div>💨 {Math.round(
                                      WeatherService.convertWindSpeed(
                                        day.windSpeed,
                                        settings.windSpeedUnit
                                      )
                                    )} {settings.windSpeedUnit}</div>
                                    {day.pop > 0 && <div>🌧️ {Math.round(day.pop * 100)}%</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
