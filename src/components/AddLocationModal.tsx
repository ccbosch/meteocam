import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocations } from '@/hooks/useLocations';
import { WeatherService } from '@/services/WeatherService';
import { WebcamSearchService } from '@/services/WebcamSearchService';
import { GeocodingResult } from '@/types';
import { useDialog } from '@/components/DialogProvider';
import { useI18n } from '@/hooks/useI18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isOpen, onClose }) => {
  const { addLocation } = useLocations();
  const { showAlert } = useDialog();
  const { t } = useI18n();
  const [mode, setMode] = useState<'search' | 'manual' | 'map'>('search');
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [locationName, setLocationName] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLon, setMapLon] = useState<number | null>(null);
  const [webcamUrls, setWebcamUrls] = useState<Array<{ url: string; name: string }>>([
    { url: '', name: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchingWebcams, setIsSearchingWebcams] = useState(false);
  const [foundWebcams, setFoundWebcams] = useState<Array<{ url: string; name: string; source: string }>>([]);
  const [webcamSuggestions, setWebcamSuggestions] = useState<string[]>([]);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [hasTriedAutoLocate, setHasTriedAutoLocate] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await WeatherService.searchLocations(searchQuery);
      if (results.length === 0) {
        setSearchError(t('add.errorNoLocations'));
      }
      setSearchResults(results);
    } catch (error: any) {
      console.error('Search error:', error);
      console.error('Error details:', error.message, error.stack);
      
      // More specific error message
      let errorMsg = 'Failed to search locations. ';
      if (error.message.includes('Failed to fetch')) {
        errorMsg += 'Network error - check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMsg += 'Invalid API key - check your .env file.';
      } else {
        errorMsg += 'Please check your internet connection and API key.';
      }
      setSearchError(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: GeocodingResult) => {
    setSelectedLocation(result);
    setLocationName(result.name);
    setStep('details');
    // Search for webcams near this location
    searchWebcamsForLocation(result.lat, result.lon, result.name);
  };

  const handleManualEntry = () => {
    if (!locationName.trim() || !manualLat.trim() || !manualLon.trim()) {
      return;
    }
    // Validate coordinates
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setSearchError(t('add.errorInvalidCoords'));
      return;
    }
    setSelectedLocation({ name: locationName, lat, lon, country: '', state: '' });
    setStep('details');
    // Search for webcams near this location
    searchWebcamsForLocation(lat, lon, locationName);
  };

  const handleMapEntry = () => {
    if (!locationName.trim() || mapLat === null || mapLon === null) {
      setSearchError(t('add.errorSelectMapLocation'));
      return;
    }
    setSelectedLocation({ name: locationName, lat: mapLat, lon: mapLon, country: '', state: '' });
    setStep('details');
    // Search for webcams near this location
    searchWebcamsForLocation(mapLat, mapLon, locationName);
  };

  const searchWebcamsForLocation = async (lat: number, lon: number, name: string) => {
    setIsSearchingWebcams(true);
    setFoundWebcams([]);
    setWebcamSuggestions([]);
    
    try {
      const { webcams, suggestions } = await WebcamSearchService.searchNearbyWebcams(lat, lon, name);
      setFoundWebcams(webcams);
      setWebcamSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching webcams:', error);
    } finally {
      setIsSearchingWebcams(false);
    }
  };

  const addFoundWebcam = (webcam: { url: string; name: string; source: string }) => {
    // Check if already added
    const exists = webcamUrls.some(w => w.url === webcam.url);
    if (exists) return;

    // Add to the list
    setWebcamUrls([...webcamUrls.filter(w => w.url.trim()), { url: webcam.url, name: webcam.name }]);
  };

  const updateMapSelection = (lat: number, lon: number, mapInstance?: L.Map) => {
    setMapLat(lat);
    setMapLon(lon);
    setSearchError(null);

    const map = mapInstance || mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 13);
  };

  const locateWithGPS = (mapInstance?: L.Map) => {
    if (!navigator.geolocation) {
      setSearchError(t('add.gpsNotSupported'));
      return;
    }

    setIsLocatingGPS(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMapSelection(latitude, longitude, mapInstance);
        setLocationName((prev) => (prev.trim() ? prev : t('add.myLocationName')));
        setIsLocatingGPS(false);
      },
      (error) => {
        let message = t('add.gpsUnknownError');

        if (error.code === error.PERMISSION_DENIED) {
          message = t('add.gpsPermissionDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = t('add.gpsPositionUnavailable');
        } else if (error.code === error.TIMEOUT) {
          message = t('add.gpsTimeout');
        }

        setSearchError(message);
        setIsLocatingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // Initialize map when mode changes to 'map'
  useEffect(() => {
    if (mode === 'map' && isOpen && mapContainerRef.current && !mapRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current).setView([20, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMapSelection(lat, lng, map);
      });

      mapRef.current = map;

      // Force map to resize after it's rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      const isMobileDevice =
        window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
      if (isMobileDevice && !hasTriedAutoLocate) {
        setHasTriedAutoLocate(true);
        locateWithGPS(map);
      }
    }

    // Cleanup map when switching modes or closing
    return () => {
      if (mapRef.current && mode !== 'map') {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mode, isOpen, hasTriedAutoLocate]);

  const addWebcamField = () => {
    setWebcamUrls([...webcamUrls, { url: '', name: '' }]);
  };

  const removeWebcamField = (index: number) => {
    setWebcamUrls(webcamUrls.filter((_, i) => i !== index));
  };

  const updateWebcamUrl = (index: number, field: 'url' | 'name', value: string) => {
    const updated = [...webcamUrls];
    updated[index][field] = value;
    setWebcamUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get coordinates from either search result, manual entry, or map selection
    let lat: number, lon: number, name: string;
    
    if (mode === 'manual') {
      lat = parseFloat(manualLat);
      lon = parseFloat(manualLon);
      name = locationName.trim();
      if (!name || isNaN(lat) || isNaN(lon)) return;
    } else if (mode === 'map') {
      if (mapLat === null || mapLon === null || !locationName.trim()) return;
      lat = mapLat;
      lon = mapLon;
      name = locationName.trim();
    } else {
      if (!selectedLocation || !locationName.trim()) return;
      lat = selectedLocation.lat;
      lon = selectedLocation.lon;
      name = locationName;
    }

    const validWebcams = webcamUrls.filter((w) => w.url.trim());
    if (validWebcams.length === 0) {
      await showAlert({
        title: t('add.webcamRequiredTitle'),
        message: t('add.webcamRequiredMessage'),
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addLocation(name, lat, lon, validWebcams);
      handleClose();
    } catch (error) {
      console.error('Error adding location:', error);
      await showAlert({
        title: t('add.errorTitle'),
        message: t('add.errorAddLocation'),
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up map if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }
    
    setMode('search');
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setManualLat('');
    setManualLon('');
    setMapLat(null);
    setMapLon(null);
    setSelectedLocation(null);
    setLocationName('');
    setWebcamUrls([{ url: '', name: '' }]);
    setSearchError(null);
    setFoundWebcams([]);
    setWebcamSuggestions([]);
    setIsSearchingWebcams(false);
    setIsLocatingGPS(false);
    setHasTriedAutoLocate(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('add.title')}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {step === 'search' && (
            <>
              {/* Mode Toggle */}
              <div className="flex space-x-2 mb-6 border-b dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setMode('search'); setSearchError(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    mode === 'search'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  🔍 {t('add.searchCity')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('map'); setSearchError(null); setMapLat(null); setMapLon(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    mode === 'map'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  🗺️ {t('add.mapPicker')}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('manual'); setSearchError(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${
                    mode === 'manual'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  📍 {t('add.manualEntry')}
                </button>
              </div>

              {mode === 'search' && (
                <div>
              <form onSubmit={handleSearch} className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('add.searchLabel')}</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('add.searchPlaceholder')}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="btn-primary"
                  >
                    {isSearching ? t('add.searching') : t('add.search')}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 {t('add.searchTip')}
                </p>
              </form>

              {searchError && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{searchError}</p>
                </div>
              )}

              {!isSearching && searchResults.length === 0 && !searchError && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="font-medium mb-1">{t('add.startSearching')}</p>
                  <p className="text-sm">{t('add.tryPopular')}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {['Paris', 'Tokyo', 'New York', 'London', 'Sydney'].map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchQuery(city);
                          handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('add.selectLocation')}</p>
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">
                        {result.state ? `${result.state}, ` : ''}
                        {result.country}
                      </div>
                      <div className="text-xs text-gray-400">
                        {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              </div>
            )}

            {mode === 'manual' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ {t('add.manualInfo')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('add.locationName')}</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t('add.searchPlaceholder')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('add.latitude')}</label>
                    <input
                      type="number"
                      step="any"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="e.g., 48.8566"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('add.longitude')}</label>
                    <input
                      type="number"
                      step="any"
                      value={manualLon}
                      onChange={(e) => setManualLon(e.target.value)}
                      placeholder="e.g., 2.3522"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>

                {searchError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{searchError}</p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>{t('add.howToFindCoords')}</strong>
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    <li>{t('add.coordsTipGoogleMaps')}</li>
                    <li>{t('add.coordsTipSearch')}</li>
                    <li>Use <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">LatLong.net</a></li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleManualEntry}
                  disabled={!locationName.trim() || !manualLat.trim() || !manualLon.trim()}
                  className="btn-primary w-full"
                >
                  {t('add.continueToWebcams')}
                </button>
              </div>
            )}

            {mode === 'map' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    🗺️ {t('add.mapInfo')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('add.locationName')}</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t('add.searchPlaceholder')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => locateWithGPS()}
                  disabled={isLocatingGPS}
                  className="btn-secondary w-full"
                >
                  {isLocatingGPS ? t('add.locating') : t('add.useCurrentLocation')}
                </button>

                {/* Map Container */}
                <div 
                  ref={mapContainerRef}
                  className="w-full h-96 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                  style={{ minHeight: '400px' }}
                />

                {/* Selected Coordinates Display */}
                {mapLat !== null && mapLon !== null && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ {t('add.selectedCoords', { lat: mapLat.toFixed(6), lon: mapLon.toFixed(6) })}
                    </p>
                  </div>
                )}

                {searchError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{searchError}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMapEntry}
                  disabled={!locationName.trim() || mapLat === null || mapLon === null}
                  className="btn-primary w-full"
                >
                  {t('add.continueToWebcams')}
                </button>
              </div>
            )}
            </>
          )}

          {step === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('search')}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('add.backToSearch')}
              </button>

              <div>
                <label className="block text-sm font-medium mb-2">{t('add.locationName')}</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>

              {/* Webcam Search Results */}
              {isSearchingWebcams && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      🔍 {t('add.searchingWebcams')}
                    </p>
                  </div>
                </div>
              )}

              {!isSearchingWebcams && foundWebcams.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">{t('add.foundNearby')}</label>
                    <span className="text-xs text-gray-500">{t('add.foundCount', { count: foundWebcams.length })}</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 border dark:border-gray-700 rounded-lg p-3">
                    {foundWebcams.map((webcam, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{webcam.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{webcam.source}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addFoundWebcam(webcam)}
                          className="ml-2 px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                          disabled={webcamUrls.some(w => w.url === webcam.url)}
                        >
                          {webcamUrls.some(w => w.url === webcam.url) ? `✓ ${t('add.added')}` : `+ ${t('add.add')}`}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 {t('add.quickAddHint')}
                  </p>
                </div>
              )}

              {!isSearchingWebcams && foundWebcams.length === 0 && webcamSuggestions.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    📷 {t('add.noneFound')}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {t('add.tryGoogleTerms')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webcamSuggestions.slice(0, 3).map((suggestion, index) => (
                      <a
                        key={index}
                        href={`https://www.google.com/search?q=${encodeURIComponent(suggestion)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                      >
                        "{suggestion}"
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">{t('add.webcamUrls')}</label>
                  <button
                    type="button"
                    onClick={addWebcamField}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + {t('add.addAnother')}
                  </button>
                </div>
                <div className="space-y-3">
                  {webcamUrls.map((webcam, index) => (
                    <div key={index} className="flex space-x-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={webcam.url}
                          onChange={(e) => updateWebcamUrl(index, 'url', e.target.value)}
                          placeholder={t('add.urlPlaceholder')}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                          required={index === 0}
                        />
                        <input
                          type="text"
                          value={webcam.name}
                          onChange={(e) => updateWebcamUrl(index, 'name', e.target.value)}
                          placeholder={t('add.namePlaceholderOptional')}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      {webcamUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWebcamField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('add.urlHint')}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                >
                  {t('add.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? t('add.adding') : t('add.addLocation')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddLocationModal;
