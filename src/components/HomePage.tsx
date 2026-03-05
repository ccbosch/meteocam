import React, { useState } from 'react';
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

const HomePage: React.FC = () => {
  const { locations, isLoading } = useLocations();
  const { currentView } = useAppStore();
  const { t } = useI18n();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsEditModalOpen(true);
  };

  const handleEditSaved = () => {
    // LocationService.updateLocation already updated the DB
    // useLocations hook will automatically refetch
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

      {currentView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <LocationCard 
              key={location.id} 
              location={location}
              onEdit={handleEditLocation}
            />
          ))}
        </div>
      )}

      {currentView === 'list' && <LocationList locations={locations} />}

      {currentView === 'map' && <MapView locations={locations} />}

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
