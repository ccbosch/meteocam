import React, { useState, useEffect } from 'react';
import { Location } from '@/types';
import { LocationService } from '@/services/LocationService';
import { WebcamSearchService } from '@/services/WebcamSearchService';
import { useDialog } from '@/components/DialogProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

interface EditLocationModalProps {
  isOpen: boolean;
  location: Location | null;
  onClose: () => void;
  onSave?: () => void;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({ isOpen, location, onClose, onSave }) => {
  const { showAlert } = useDialog();
  const { t } = useI18n();
  const [locationName, setLocationName] = useState('');
  const [webcamUrls, setWebcamUrls] = useState<Array<{ url: string; name: string }>>([]);
  const [isSearchingWebcams, setIsSearchingWebcams] = useState(false);
  const [foundWebcams, setFoundWebcams] = useState<Array<{ url: string; name: string; source: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location && isOpen) {
      setLocationName(location.name);
      setWebcamUrls(location.webcamUrls.map(w => ({ url: w.url, name: w.name || '' })));
      setFoundWebcams([]);
      setError(null);
      // Search for webcams when modal opens
      searchWebcams();
    }
  }, [location, isOpen]);

  const searchWebcams = async () => {
    if (!location) return;
    
    setIsSearchingWebcams(true);
    try {
      const { webcams } = await WebcamSearchService.searchNearbyWebcams(
        location.latitude,
        location.longitude,
        location.name
      );
      setFoundWebcams(webcams);
    } catch (error) {
      console.error('Error searching webcams:', error);
    } finally {
      setIsSearchingWebcams(false);
    }
  };

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

  const addFoundWebcam = (webcam: { url: string; name: string; source: string }) => {
    const exists = webcamUrls.some(w => w.url === webcam.url);
    if (exists) return;
    setWebcamUrls([...webcamUrls.filter(w => w.url.trim()), { url: webcam.url, name: webcam.name }]);
  };

  const handleSave = async () => {
    if (!location) return;

    const validWebcams = webcamUrls.filter(w => w.url.trim());
    if (validWebcams.length === 0) {
      await showAlert({
        title: t('edit.webcamRequiredTitle'),
        message: t('edit.webcamRequiredMessage'),
        type: 'warning'
      });
      return;
    }

    setIsSaving(true);
    try {
      await LocationService.updateLocation(location.id, {
        name: locationName,
        webcamUrls: validWebcams.map(w => ({
          id: undefined as any, // Will be preserved by the service
          ...w
        }))
      });

      await showAlert({
        title: t('edit.successTitle'),
        message: t('edit.successMessage'),
        type: 'success'
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      setError(t('edit.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !location) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('edit.title')}</h2>
              <button
                onClick={onClose}
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

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              {/* Location Info */}
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
                      🔍 {t('edit.searchingWebcams')}
                    </p>
                  </div>
                </div>
              )}

              {!isSearchingWebcams && foundWebcams.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">{t('edit.foundNearby')}</label>
                    <span className="text-xs text-gray-500">{t('edit.foundCount', { count: foundWebcams.length })}</span>
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
                    💡 {t('edit.quickAddHint')}
                  </p>
                </div>
              )}

              {/* Webcam URLs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">{t('edit.webcamUrls')}</label>
                  <button
                    type="button"
                    onClick={addWebcamField}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + {t('edit.addAnother')}
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
                          className="text-red-500 hover:text-red-700 mt-2"
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

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  {t('edit.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex-1"
                >
                  {isSaving ? t('edit.saving') : t('edit.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditLocationModal;
