import React, { useState, useMemo } from 'react';
import { Location } from '@/types';
import { useLocations } from '@/hooks/useLocations';
import { useAppStore } from '@/stores/appStore';
import LocationCard from './LocationCard';
import LocationList from './LocationList';
import MapView from './MapView';
import AddLocationModal from './AddLocationModal';
import EditLocationModal from './EditLocationModal';
import EmptyState from './EmptyState';
import { useI18n } from '@/hooks/useI18n';
import { db } from '@/db/schema';
import { LocationService } from '@/services/LocationService';

const HomePage: React.FC = () => {
  const { locations, isLoading } = useLocations();
  const { currentView, settings } = useAppStore();
  const { t } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sort locations based on user preference
  const sortedLocations = useMemo(() => {
    if (!locations) return [];
    
    const sorted = [...locations];
    
    switch (settings.locationSortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'date-asc':
        return sorted.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
      case 'date-desc':
        return sorted.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
      case 'custom':
      default:
        return sorted.sort((a, b) => a.order - b.order);
    }
  }, [locations, settings.locationSortBy]);

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsEditModalOpen(true);
  };

  const handleEditSaved = () => {
    // LocationService.updateLocation already updated the DB
    // useLocations hook will automatically refetch
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Clear all weather cache to force fresh fetch
      await db.weatherData.clear();
      
      // Increment refresh key to force remount of all LocationCards
      // This will trigger all useWeather and useWebcam hooks to refetch
      setRefreshKey(prev => prev + 1);
      
      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <>
        <EmptyState onAddLocation={() => setIsAddModalOpen(true)} />
        <AddLocationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('home.myLocations')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="btn-secondary flex items-center space-x-2"
            title={t('home.refresh')}
          >
            <svg 
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">{isRefreshing ? t('home.refreshing') : t('home.refresh')}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>{t('home.addLocation')}</span>
          </button>
        </div>
      </div>

      {currentView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLocations.map((location) => (
            <LocationCard 
              key={`${location.id}-${refreshKey}`}
              location={location}
              onEdit={handleEditLocation}
            />
          ))}
        </div>
      )}

      {currentView === 'list' && (
        <LocationList 
          locations={sortedLocations}
          isDraggable={settings.locationSortBy === 'custom'}
          onReorder={async (locationIds: string[]) => {
            await LocationService.reorderLocations(locationIds);
          }}
        />
      )}

      {currentView === 'map' && <MapView locations={sortedLocations} />}

      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditLocationModal
        isOpen={isEditModalOpen}
        location={editingLocation}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleEditSaved}
      />
    </div>
  );
};

export default HomePage;
