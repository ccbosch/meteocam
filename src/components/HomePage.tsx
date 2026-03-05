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
  const [draggedLocation, setDraggedLocation] = useState<string | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<string | null>(null);

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

  const handleDragStart = (locationId: string) => {
    if (settings.locationSortBy === 'custom') {
      setDraggedLocation(locationId);
    }
  };

  const handleDragOver = (e: React.DragEvent, locationId: string) => {
    e.preventDefault();
    if (draggedLocation && draggedLocation !== locationId && settings.locationSortBy === 'custom') {
      setDragOverLocation(locationId);
    }
  };

  const handleDragEnd = async () => {
    if (draggedLocation && dragOverLocation && settings.locationSortBy === 'custom') {
      const newOrder = [...sortedLocations];
      const draggedIndex = newOrder.findIndex(loc => loc.id === draggedLocation);
      const dropIndex = newOrder.findIndex(loc => loc.id === dragOverLocation);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Remove dragged item
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        // Insert at new position
        newOrder.splice(dropIndex, 0, draggedItem);
        
        // Update order in database
        const locationIds = newOrder.map(loc => loc.id);
        await LocationService.reorderLocations(locationIds);
      }
    }
    
    setDraggedLocation(null);
    setDragOverLocation(null);
  };

  const handleDragLeave = () => {
    setDragOverLocation(null);
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
        <>
          {settings.locationSortBy === 'custom' && sortedLocations.length > 1 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>{t('home.dragToReorder')}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLocations.map((location) => (
              <LocationCard 
                key={`${location.id}-${refreshKey}`}
                location={location}
                onEdit={handleEditLocation}
                isDraggable={settings.locationSortBy === 'custom'}
                isDragging={draggedLocation === location.id}
                isDragOver={dragOverLocation === location.id}
                onDragStart={() => handleDragStart(location.id)}
                onDragOver={(e) => handleDragOver(e, location.id)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
              />
            ))}
          </div>
        </>
      )}

      {currentView === 'list' && <LocationList locations={sortedLocations} />}

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
