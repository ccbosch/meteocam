import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

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
          <span>Back to Home</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Units Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Units</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Temperature</label>
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
              <label className="block text-sm font-medium mb-2">Wind Speed</label>
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
          <h2 className="text-xl font-semibold mb-4">Refresh Interval</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Default refresh interval for webcams and weather
            </label>
            <select
              value={settings.defaultRefreshInterval}
              onChange={(e) =>
                updateSettings({ defaultRefreshInterval: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value={5 * 60 * 1000}>5 minutes</option>
              <option value={15 * 60 * 1000}>15 minutes</option>
              <option value={30 * 60 * 1000}>30 minutes</option>
              <option value={60 * 60 * 1000}>1 hour</option>
            </select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) =>
                updateSettings({ theme: e.target.value as 'light' | 'dark' | 'auto' })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        {/* View Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Default View</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Default view when opening the app
            </label>
            <select
              value={settings.defaultView}
              onChange={(e) =>
                updateSettings({ defaultView: e.target.value as 'grid' | 'list' | 'map' })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
              <option value="map">Map View</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable push notifications</span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  updateSettings({ notificationsEnabled: e.target.checked })
                }
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Weather alerts</span>
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
          </div>

          {!settings.notificationsEnabled && (
            <p className="text-sm text-gray-500 mt-4">
              Enable push notifications to receive weather alerts and updates
            </p>
          )}
        </div>

        {/* About Section */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>MeteoCam</strong> - View webcams and weather forecasts from your
              favorite locations
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
