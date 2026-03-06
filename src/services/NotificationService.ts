import { WeatherData } from '@/types';

// In-memory dedup: {locationId}-{alertKey}-{YYYY-MM-DD}
const sentAlerts = new Set<string>();

interface AlertDef {
  key: string;
  check: (d: WeatherData) => boolean;
  title: Record<'en' | 'fr', string>;
  body: Record<'en' | 'fr', (locationName: string, d: WeatherData) => string>;
}

const ALERT_DEFS: AlertDef[] = [
  {
    key: 'thunderstorm',
    check: (d) => d.current.weatherMain.toLowerCase() === 'thunderstorm',
    title: { en: '⛈️ Thunderstorm Warning', fr: '⛈️ Alerte Orage' },
    body: {
      en: (loc) => `Thunderstorm detected at ${loc}. Stay safe!`,
      fr: (loc) => `Orage détecté à ${loc}. Restez prudent !`,
    },
  },
  {
    key: 'snow',
    check: (d) => d.current.weatherMain.toLowerCase() === 'snow',
    title: { en: '❄️ Snow Alert', fr: '❄️ Alerte Neige' },
    body: {
      en: (loc) => `Snow falling at ${loc}.`,
      fr: (loc) => `Chutes de neige à ${loc}.`,
    },
  },
  {
    key: 'heavy-rain',
    check: (d) =>
      ['rain', 'drizzle'].includes(d.current.weatherMain.toLowerCase()) &&
      d.current.weatherDescription.toLowerCase().includes('heavy'),
    title: { en: '🌧️ Heavy Rain', fr: '🌧️ Pluie Forte' },
    body: {
      en: (loc) => `Heavy rain at ${loc}.`,
      fr: (loc) => `Pluie forte à ${loc}.`,
    },
  },
  {
    key: 'extreme-heat',
    check: (d) => d.current.temp >= 35,
    title: { en: '🌡️ Extreme Heat', fr: '🌡️ Chaleur Extrême' },
    body: {
      en: (loc, d) => `Extreme heat (${Math.round(d.current.temp)}°C) at ${loc}.`,
      fr: (loc, d) => `Chaleur extrême (${Math.round(d.current.temp)}°C) à ${loc}.`,
    },
  },
  {
    key: 'extreme-cold',
    check: (d) => d.current.temp <= -10,
    title: { en: '🥶 Extreme Cold', fr: '🥶 Grand Froid' },
    body: {
      en: (loc, d) => `Extreme cold (${Math.round(d.current.temp)}°C) at ${loc}.`,
      fr: (loc, d) => `Grand froid (${Math.round(d.current.temp)}°C) à ${loc}.`,
    },
  },
  {
    key: 'high-wind',
    check: (d) => d.current.windSpeed >= 17, // ~60 km/h
    title: { en: '💨 High Wind Alert', fr: '💨 Alerte Vent Fort' },
    body: {
      en: (loc, d) => `Strong winds (${Math.round(d.current.windSpeed * 3.6)} km/h) at ${loc}.`,
      fr: (loc, d) => `Vent fort (${Math.round(d.current.windSpeed * 3.6)} km/h) à ${loc}.`,
    },
  },
];

export class NotificationService {
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    return Notification.requestPermission();
  }

  static send(title: string, body: string): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
  }

  static checkWeatherAlerts(
    locationId: string,
    locationName: string,
    weatherData: WeatherData,
    lang: 'en' | 'fr'
  ): void {
    if (Notification.permission !== 'granted') return;
    const today = new Date().toISOString().split('T')[0];

    for (const alert of ALERT_DEFS) {
      if (!alert.check(weatherData)) continue;
      const dedupKey = `${locationId}-${alert.key}-${today}`;
      if (sentAlerts.has(dedupKey)) continue;
      sentAlerts.add(dedupKey);
      this.send(
        alert.title[lang],
        alert.body[lang](locationName, weatherData)
      );
    }
  }
}
