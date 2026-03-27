import React, { useState, useMemo } from 'react';
import { Location, ViewMode } from '@/types';
import { useLocations } from '@/hooks/useLocations';
import { useAppStore } from '@/stores/appStore';
import LocationCard from './LocationCard';
import LocationList from './LocationList';
import MapView from './MapView';
import LocationModal from './LocationModal';
import EmptyState from './EmptyState';
import { useI18n } from '@/hooks/useI18n';
import { db } from '@/db/schema';
import { LocationService } from '@/services/LocationService';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const { locations, isLoading, deleteLocation } = useLocations();
  const { currentView, settings, setCurrentView, setHighlightedLocationId } = useAppStore();
  const { t } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<Location | null>(null);
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

  const handleMapLocationClick = (location: Location) => {
    setSelectedMapLocation(location);
  };

  const handleLocationNameClick = (location: Location, targetView: ViewMode = 'list') => {
    setCurrentView(targetView);
    setHighlightedLocationId(location.id);
    
    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedLocationId(null);
    }, 2000);
  };

  const handleMapLocationNameClick = (location: Location) => {
    handleLocationNameClick(location, 'grid');
  };

  const handleEditSaved = () => {
    // Increment refreshKey to remount LocationCards with updated webcam data
    setRefreshKey(prev => prev + 1);
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
        <LocationModal
          mode="add"
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
              onLocationNameClick={handleLocationNameClick}
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
          onEdit={handleEditLocation}
          onDelete={(location) => deleteLocation(location.id)}
        />
      )}

      {currentView === 'map' && (
        <MapView 
          locations={sortedLocations} 
          onLocationClick={handleMapLocationClick}
          onLocationNameClick={handleMapLocationNameClick}
        />
      )}

      <LocationModal
        mode="add"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <LocationModal
        mode="edit"
        isOpen={isEditModalOpen}
        location={editingLocation}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleEditSaved}
      />

      {/* Map Location Card Modal */}
      <AnimatePresence>
        {selectedMapLocation && (
          <MapLocationCardModal
            location={selectedMapLocation}
            onClose={() => setSelectedMapLocation(null)}
            onEdit={handleEditLocation}
            onLocationNameClick={handleLocationNameClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Modal component to show location card from map
interface MapLocationCardModalProps {
  location: Location;
  onClose: () => void;
  onEdit: (location: Location) => void;
  onLocationNameClick?: (location: Location) => void;
}

const MapLocationCardModal: React.FC<MapLocationCardModalProps> = ({ location, onClose, onEdit, onLocationNameClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      <div className="relative h-full overflow-y-auto p-4 md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full p-3 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="mx-auto w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <LocationCard 
            location={location}
            onEdit={(loc) => {
              onClose();
              onEdit(loc);
            }}
            onLocationNameClick={(loc) => {
              onClose();
              onLocationNameClick?.(loc);
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
