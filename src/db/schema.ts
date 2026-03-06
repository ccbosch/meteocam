import Dexie, { Table } from 'dexie';
import {
  Location,
  WeatherData,
  AppSettings,
  NotificationPreference,
  WebcamSnapshot,
} from '@/types';

export class MeteoCamDatabase extends Dexie {
  locations!: Table<Location, string>;
  weatherData!: Table<WeatherData, string>;
  settings!: Table<AppSettings & { id: string }, string>;
  notificationPreferences!: Table<NotificationPreference & { id: string }, string>;
  webcamSnapshots!: Table<WebcamSnapshot, string>;

  constructor() {
    super('MeteoCamDB');

    this.version(1).stores({
      locations: 'id, name, addedAt, order',
      weatherData: 'locationId, fetchedAt',
      settings: 'id',
      notificationPreferences: 'id, type',
      webcamSnapshots: 'id, locationId, webcamSourceId, timestamp',
    });
  }
}

export const db = new MeteoCamDatabase();

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const existingSettings = await db.settings.get('default');
  if (!existingSettings) {
    const lang = navigator.language || navigator.languages?.[0] || 'en';
    const detectedLanguage: 'en' | 'fr' = lang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
    await db.settings.add({
      id: 'default',
      language: detectedLanguage,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
      defaultRefreshInterval: 15 * 60 * 1000, // 15 minutes
      theme: 'auto',
      defaultView: 'grid',
      locationSortBy: 'custom',
      notificationsEnabled: false,
      weatherAlertsEnabled: false,
    });
  }
};
