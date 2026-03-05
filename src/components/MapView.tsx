import React, { useEffect, useRef } from 'react';
import { Location } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '@/hooks/useI18n';

interface MapViewProps {
  locations: Location[];
  onLocationClick?: (location: Location) => void;
  onLocationNameClick?: (location: Location) => void;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapView: React.FC<MapViewProps> = ({ locations, onLocationClick, onLocationNameClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!mapContainerRef.current || locations.length === 0) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each location
    const bounds: L.LatLngBoundsExpression = [];
    locations.forEach((location) => {
      const marker = L.marker([location.latitude, location.longitude]).addTo(
        mapRef.current!
      );

      // Create popup element with click handler for location name
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-2';
      popupDiv.innerHTML = `
        <h3 id="location-name-${location.id}" class="font-semibold text-lg cursor-pointer hover:text-primary-600 transition-colors">${location.name}</h3>
        <p class="text-sm text-gray-600">${t('map.webcamsCount', { count: location.webcamUrls.length })}</p>
      `;

      const nameElement = popupDiv.querySelector(`#location-name-${location.id}`);
      if (nameElement) {
        nameElement.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onLocationNameClick) {
            onLocationNameClick(location);
          }
        });
      }

      marker.bindPopup(popupDiv);

      bounds.push([location.latitude, location.longitude]);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, t, onLocationClick, onLocationNameClick]);

  if (locations.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">{t('map.empty')}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div ref={mapContainerRef} className="h-[600px] w-full" />
    </div>
  );
};

export default MapView;
