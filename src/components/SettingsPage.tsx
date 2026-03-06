import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/hooks/useI18n';
import { NotificationService } from '@/services/NotificationService';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const { t } = useI18n();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    NotificationService.getPermission()
  );

  useEffect(() => {
    setPermission(NotificationService.getPermission());
  }, [settings.notificationsEnabled]);

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await NotificationService.requestPermission();
      setPermission(result);
      updateSettings({ notificationsEnabled: result === 'granted' });
    } else {
      updateSettings({ notificationsEnabled: false, weatherAlertsEnabled: false });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>{t('settings.backHome')}</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>

          <div>
            <label className="block text-sm font-medium mb-2">{t('settings.languageLabel')}</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'fr' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="en">{t('settings.languageEnglish')}</option>
              <option value="fr">{t('settings.languageFrench')}</option>
            </select>
          </div>
        </div>

        {/* Units Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.units')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.temperature')}</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="temperature"
                    value="celsius"
                    checked={settings.temperatureUnit === 'celsius'}
                    onChange={() => updateSettings({ temperatureUnit: 'celsius' })}
                    className="mr-2"
                  />
                  Celsius (°C)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="temperature"
                    value="fahrenheit"
                    checked={settings.temperatureUnit === 'fahrenheit'}
                    onChange={() => updateSettings({ temperatureUnit: 'fahrenheit' })}
                    className="mr-2"
                  />
                  Fahrenheit (°F)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.windSpeed')}</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="windSpeed"
                    value="kmh"
                    checked={settings.windSpeedUnit === 'kmh'}
                    onChange={() => updateSettings({ windSpeedUnit: 'kmh' })}
                    className="mr-2"
                  />
                  km/h
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="windSpeed"
                    value="mph"
                    checked={settings.windSpeedUnit === 'mph'}
                    onChange={() => updateSettings({ windSpeedUnit: 'mph' })}
                    className="mr-2"
                  />
                  mph
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.refresh')}</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.refreshLabel')}
            </label>
            <select
              value={settings.defaultRefreshInterval}
              onChange={(e) =>
                updateSettings({ defaultRefreshInterval: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={5 * 60 * 1000}>{t('settings.minutes5')}</option>
              <option value={15 * 60 * 1000}>{t('settings.minutes15')}</option>
              <option value={30 * 60 * 1000}>{t('settings.minutes30')}</option>
              <option value={60 * 60 * 1000}>{t('settings.hour1')}</option>
            </select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.appearance')}</h2>

          <div>
            <label className="block text-sm font-medium mb-2">{t('settings.theme')}</label>
            <select
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="light">{t('settings.themeLight')}</option>
              <option value="dark">{t('settings.themeDark')}</option>
              <option value="auto">{t('settings.themeAuto')}</option>
            </select>
          </div>
        </div>

        {/* View Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.defaultView')}</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settings.defaultViewLabel')}
            </label>
            <select
              value={settings.defaultView}
              onChange={(e) =>
                updateSettings({ defaultView: e.target.value as 'grid' | 'list' | 'map' })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="grid">{t('settings.gridView')}</option>
              <option value="list">{t('settings.listView')}</option>
              <option value="map">{t('settings.mapView')}</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.notifications')}</h2>

          {permission === 'unsupported' ? (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {t('settings.notificationsUnsupported')}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{t('settings.pushNotifications')}</span>
                  {permission === 'denied' && (
                    <p className="text-xs text-red-500 mt-0.5">{t('settings.notificationsDenied')}</p>
                  )}
                  {permission === 'granted' && settings.notificationsEnabled && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{t('settings.notificationsGranted')}</p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleNotificationsToggle(e.target.checked)}
                  disabled={permission === 'denied'}
                  className="w-5 h-5"
                />
              </div>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('settings.weatherAlerts')}</span>
                <input
                  type="checkbox"
                  checked={settings.weatherAlertsEnabled}
                  onChange={(e) =>
                    updateSettings({ weatherAlertsEnabled: e.target.checked })
                  }
                  className="w-5 h-5"
                  disabled={!settings.notificationsEnabled}
                />
              </label>

              {!settings.notificationsEnabled && permission !== 'denied' && (
                <p className="text-sm text-gray-500">
                  {t('settings.notificationsHint')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.about')}</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>MeteoCam</strong> - {t('settings.aboutText')}
            </p>
            <p>Version 1.0.0</p>
            <p className="pt-4">
              Weather data provided by{' '}
              <a
                href="https://openweathermap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                OpenWeatherMap
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
