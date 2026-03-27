import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocations } from '@/hooks/useLocations';
import { WeatherService } from '@/services/WeatherService';
import { WebcamService } from '@/services/WebcamService';
import { WebcamSearchService } from '@/services/WebcamSearchService';
import { LocationService } from '@/services/LocationService';
import { GeocodingResult, Location } from '@/types';
import { useDialog } from '@/components/DialogProvider';
import { useI18n } from '@/hooks/useI18n';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type WebcamEntry = { url: string; name: string; type?: string };

interface LocationModalProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null; // edit mode
  onSave?: () => void;        // edit mode
}

const LocationModal: React.FC<LocationModalProps> = ({ mode, isOpen, onClose, location, onSave }) => {
  const { addLocation } = useLocations();
  const { showAlert } = useDialog();
  const { t } = useI18n();

  // ── Add-mode state ──────────────────────────────────────────────────────
  const [addStep, setAddStep] = useState<'search' | 'details'>('search');
  const [addInputMode, setAddInputMode] = useState<'search' | 'manual' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLon, setMapLon] = useState<number | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [hasTriedAutoLocate, setHasTriedAutoLocate] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // ── Edit-mode state ─────────────────────────────────────────────────────
  const [postalCode, setPostalCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ── Shared state ────────────────────────────────────────────────────────
  const [locationName, setLocationName] = useState('');
  const [webcamUrls, setWebcamUrls] = useState<WebcamEntry[]>([{ url: '', name: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchingWebcams, setIsSearchingWebcams] = useState(false);
  const [foundWebcams, setFoundWebcams] = useState<Array<{ url: string; name: string; source: string }>>([]);
  const [webcamSuggestions, setWebcamSuggestions] = useState<string[]>([]);
  const [previewWebcam, setPreviewWebcam] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Prefill for edit mode ───────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && location && isOpen) {
      setLocationName(location.name);
      setPostalCode(location.postalCode || '');
      setWebcamUrls(location.webcamUrls.map(w => ({ url: w.url, name: w.name || '', type: w.type })));
      setFoundWebcams([]);
      setPreviewWebcam(null);
      setError(null);
      searchWebcamsForLocation(location.latitude, location.longitude, location.name);
    }
  }, [location, isOpen, mode]);

  // ── Map effect (add mode) ───────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'add') return;
    if (addInputMode === 'map' && isOpen && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      map.on('click', (e: L.LeafletMouseEvent) => {
        updateMapSelection(e.latlng.lat, e.latlng.lng, map);
      });
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      const isMobileDevice =
        globalThis.matchMedia('(pointer: coarse)').matches || globalThis.innerWidth <= 768;
      if (isMobileDevice && !hasTriedAutoLocate) {
        setHasTriedAutoLocate(true);
        locateWithGPS(map);
      }
    }
    return () => {
      if (mapRef.current && addInputMode !== 'map') {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [addInputMode, isOpen, hasTriedAutoLocate, mode]);

  // ── Webcam search ───────────────────────────────────────────────────────
  const searchWebcamsForLocation = async (lat: number, lon: number, name: string) => {
    setIsSearchingWebcams(true);
    setFoundWebcams([]);
    setWebcamSuggestions([]);
    try {
      const { webcams, suggestions } = await WebcamSearchService.searchNearbyWebcams(lat, lon, name);
      setFoundWebcams(webcams);
      setWebcamSuggestions(suggestions ?? []);
    } catch (err) {
      console.error('Error searching webcams:', err);
    } finally {
      setIsSearchingWebcams(false);
    }
  };

  // ── Webcam URL management ───────────────────────────────────────────────
  const addWebcamField = () => setWebcamUrls([...webcamUrls, { url: '', name: '' }]);
  const removeWebcamField = (index: number) => setWebcamUrls(webcamUrls.filter((_, i) => i !== index));
  const updateWebcamUrl = (index: number, field: 'url' | 'name' | 'type', value: string) => {
    const updated = [...webcamUrls];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'url') updated[index].type = WebcamService.detectType(value);
    setWebcamUrls(updated);
  };
  const addFoundWebcam = (webcam: { url: string; name: string; source: string }) => {
    if (webcamUrls.some(w => w.url === webcam.url)) return;
    setWebcamUrls([...webcamUrls.filter(w => w.url.trim()), { url: webcam.url, name: webcam.name }]);
  };

  // ── Add-mode helpers ────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await WeatherService.searchLocations(searchQuery);
      if (results.length === 0) setSearchError(t('add.errorNoLocations'));
      setSearchResults(results);
    } catch (err: any) {
      let msg = 'Failed to search locations. ';
      if (err.message.includes('Failed to fetch')) msg += 'Network error - check your internet connection.';
      else if (err.message.includes('401')) msg += 'Invalid API key - check your .env file.';
      else msg += 'Please check your internet connection and API key.';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: GeocodingResult) => {
    setSelectedLocation(result);
    setLocationName(result.name);
    setAddStep('details');
    searchWebcamsForLocation(result.lat, result.lon, result.name);
  };

  const handleManualEntry = () => {
    if (!locationName.trim() || !manualLat.trim() || !manualLon.trim()) return;
    const lat = Number.parseFloat(manualLat);
    const lon = Number.parseFloat(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setSearchError(t('add.errorInvalidCoords'));
      return;
    }
    setSelectedLocation({ name: locationName, lat, lon, country: '', state: '' });
    setAddStep('details');
    searchWebcamsForLocation(lat, lon, locationName);
  };

  const handleMapEntry = () => {
    if (!locationName.trim() || mapLat === null || mapLon === null) {
      setSearchError(t('add.errorSelectMapLocation'));
      return;
    }
    setSelectedLocation({ name: locationName, lat: mapLat, lon: mapLon, country: '', state: '' });
    setAddStep('details');
    searchWebcamsForLocation(mapLat, mapLon, locationName);
  };

  const updateMapSelection = (lat: number, lon: number, mapInstance?: L.Map) => {
    setMapLat(lat);
    setMapLon(lon);
    setSearchError(null);
    const map = mapInstance ?? mapRef.current;
    if (!map) return;
    markerRef.current?.remove();
    markerRef.current = L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 13);
  };

  const locateWithGPS = (mapInstance?: L.Map) => {
    if (!navigator.geolocation) { setSearchError(t('add.gpsNotSupported')); return; }
    setIsLocatingGPS(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateMapSelection(coords.latitude, coords.longitude, mapInstance);
        setLocationName(prev => prev.trim() ? prev : t('add.myLocationName'));
        setIsLocatingGPS(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          [err.PERMISSION_DENIED]: t('add.gpsPermissionDenied'),
          [err.POSITION_UNAVAILABLE]: t('add.gpsPositionUnavailable'),
          [err.TIMEOUT]: t('add.gpsTimeout'),
        };
        setSearchError(messages[err.code] ?? t('add.gpsUnknownError'));
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  // ── Submit / Save ───────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let lat: number, lon: number, name: string;
    if (addInputMode === 'manual') {
      lat = Number.parseFloat(manualLat);
      lon = Number.parseFloat(manualLon);
      name = locationName.trim();
      if (!name || Number.isNaN(lat) || Number.isNaN(lon)) return;
    } else if (addInputMode === 'map') {
      if (mapLat === null || mapLon === null || !locationName.trim()) return;
      lat = mapLat; lon = mapLon; name = locationName.trim();
    } else {
      if (!selectedLocation || !locationName.trim()) return;
      lat = selectedLocation.lat; lon = selectedLocation.lon; name = locationName;
    }
    const validWebcams = webcamUrls.filter(w => w.url.trim());
    if (validWebcams.length === 0) {
      await showAlert({ title: t('add.webcamRequiredTitle'), message: t('add.webcamRequiredMessage'), type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await addLocation(name, lat, lon, validWebcams);
      handleClose();
    } catch (err) {
      console.error('Error adding location:', err);
      await showAlert({ title: t('add.errorTitle'), message: t('add.errorAddLocation'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    const validWebcams = webcamUrls.filter(w => w.url.trim());
    if (validWebcams.length === 0) {
      await showAlert({ title: t('edit.webcamRequiredTitle'), message: t('edit.webcamRequiredMessage'), type: 'warning' });
      return;
    }
    setIsSaving(true);
    try {
      await LocationService.updateLocation(location.id, {
        name: locationName,
        postalCode: postalCode.trim() || undefined,
        webcamUrls: validWebcams.map(w => ({
          id: undefined as any,
          ...w,
          type: w.type as import('@/types').WebcamType | undefined,
        })),
      });
      await showAlert({ title: t('edit.successTitle'), message: t('edit.successMessage'), type: 'success' });
      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error saving location:', err);
      setError(t('edit.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Close / Reset ───────────────────────────────────────────────────────
  const handleClose = () => {
    mapRef.current?.remove();
    mapRef.current = null;
    markerRef.current = null;
    setAddStep('search');
    setAddInputMode('search');
    setSearchQuery('');
    setSearchResults([]);
    setManualLat('');
    setManualLon('');
    setMapLat(null);
    setMapLon(null);
    setSelectedLocation(null);
    setLocationName('');
    setPostalCode('');
    setWebcamUrls([{ url: '', name: '' }]);
    setSearchError(null);
    setError(null);
    setFoundWebcams([]);
    setWebcamSuggestions([]);
    setIsSearchingWebcams(false);
    setIsLocatingGPS(false);
    setHasTriedAutoLocate(false);
    setPreviewWebcam(null);
    onClose();
  };

  if (!isOpen) return null;
  if (mode === 'edit' && !location) return null;

  // ── Shared: webcam section ──────────────────────────────────────────────
  const webcamSection = (
    <div className="space-y-4">
      {isSearchingWebcams && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-800 dark:text-blue-200">🔍 {t('add.searchingWebcams')}</p>
          </div>
        </div>
      )}

      {!isSearchingWebcams && foundWebcams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">{t('add.foundNearby')}</label>
            <span className="text-xs text-gray-500">{t('add.foundCount', { count: foundWebcams.length })}</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 max-h-72 overflow-y-auto space-y-2 border dark:border-gray-700 rounded-lg p-3">
              {foundWebcams.map((webcam, index) => (
                <div
                  key={`${webcam.url}-${index}`}
                  onMouseEnter={() => setPreviewWebcam(webcam.url)}
                  className={`flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer ${
                    previewWebcam === webcam.url ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{webcam.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{webcam.source}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addFoundWebcam(webcam)}
                    className="ml-2 px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors flex-shrink-0"
                    disabled={webcamUrls.some(w => w.url === webcam.url)}
                  >
                    {webcamUrls.some(w => w.url === webcam.url) ? `✓ ${t('add.added')}` : `+ ${t('add.add')}`}
                  </button>
                </div>
              ))}
            </div>
            <div className="w-48 flex-shrink-0 border dark:border-gray-700 rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
              {previewWebcam ? (
                <img
                  key={previewWebcam}
                  src={previewWebcam}
                  alt="Webcam preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.replaceWith(Object.assign(document.createElement('p'), {
                      className: 'text-xs text-gray-400 text-center p-2',
                      textContent: 'Preview unavailable',
                    }));
                  }}
                />
              ) : (
                <p className="text-xs text-gray-400 text-center p-3">Hover a webcam to preview</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">💡 {t('add.quickAddHint')}</p>
        </div>
      )}

      {!isSearchingWebcams && foundWebcams.length === 0 && webcamSuggestions.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">📷 {t('add.noneFound')}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">{t('add.tryGoogleTerms')}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {webcamSuggestions.slice(0, 3).map((suggestion, index) => (
              <a
                key={`${suggestion}-${index}`}
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
          <button type="button" onClick={addWebcamField} className="text-sm text-primary-600 hover:text-primary-700">
            + {t('add.addAnother')}
          </button>
        </div>
        <div className="space-y-3">
          {webcamUrls.map((webcam, index) => (
            <div key={`webcam-${index}`} className="flex space-x-2">
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
                {webcam.url && (
                  <select
                    value={webcam.type || WebcamService.detectType(webcam.url)}
                    onChange={(e) => updateWebcamUrl(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                  >
                    <option value="image">📷 Image (auto-refresh)</option>
                    <option value="mjpeg">🎥 MJPEG Stream (live)</option>
                    <option value="hls">📺 HLS Stream (.m3u8)</option>
                    <option value="mp4">🎬 MP4 / Video</option>
                    <option value="embed">🖥️ Embed (iframe)</option>
                  </select>
                )}
              </div>
              {webcamUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWebcamField(index)}
                  className="text-red-500 hover:text-red-700 mt-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">{t('add.urlHint')}</p>
      </div>
    </div>
  );

  // ── Shared: close button ────────────────────────────────────────────────
  const closeBtn = (
    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  // ── EDIT MODE ───────────────────────────────────────────────────────────
  if (mode === 'edit') {
    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('edit.title')}</h2>
                {closeBtn}
              </div>
              <form onSubmit={handleEditSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('edit.postalCode')}</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder={t('edit.postalCodePlaceholder')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
                {webcamSection}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t('edit.cancel')}</button>
                  <button type="submit" disabled={isSaving} className="btn-primary flex-1">
                    {isSaving ? t('edit.saving') : t('edit.saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // ── ADD MODE ────────────────────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('add.title')}</h2>
            {closeBtn}
          </div>

          {addStep === 'search' && (
            <>
              <div className="flex space-x-2 mb-6 border-b dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setAddInputMode('search'); setSearchError(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${addInputMode === 'search' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  🔍 {t('add.searchCity')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAddInputMode('map'); setSearchError(null); setMapLat(null); setMapLon(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${addInputMode === 'map' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  🗺️ {t('add.mapPicker')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAddInputMode('manual'); setSearchError(null); }}
                  className={`px-4 py-2 font-medium transition-colors ${addInputMode === 'manual' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  📍 {t('add.manualEntry')}
                </button>
              </div>

              {addInputMode === 'search' && (
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
                      <button type="submit" disabled={isSearching || !searchQuery.trim()} className="btn-primary">
                        {isSearching ? t('add.searching') : t('add.search')}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">💡 {t('add.searchTip')}</p>
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
                            onClick={() => { setSearchQuery(city); handleSearch({ preventDefault: () => {} } as React.FormEvent); }}
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
                          key={`result-${index}`}
                          onClick={() => handleSelectLocation(result)}
                          className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                        >
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-gray-500">
                            {result.state ? `${result.state}, ` : ''}{result.country}
                          </div>
                          <div className="text-xs text-gray-400">{result.lat.toFixed(4)}, {result.lon.toFixed(4)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {addInputMode === 'manual' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">ℹ️ {t('add.manualInfo')}</p>
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

              {addInputMode === 'map' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">🗺️ {t('add.mapInfo')}</p>
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
                  <button type="button" onClick={() => locateWithGPS()} disabled={isLocatingGPS} className="btn-secondary w-full">
                    {isLocatingGPS ? t('add.locating') : t('add.useCurrentLocation')}
                  </button>
                  <div
                    ref={mapContainerRef}
                    className="w-full h-96 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                    style={{ minHeight: '400px' }}
                  />
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

          {addStep === 'details' && (
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setAddStep('search')}
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
              {webcamSection}
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t('add.cancel')}</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
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

export default LocationModal;
