import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Location } from '@/types';
import { LocationService } from '@/services/LocationService';

export const useLocations = () => {
  const locations = useLiveQuery(() => LocationService.getAllLocations(), []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addLocation = async (
    name: string,
    latitude: number,
    longitude: number,
    webcamUrls: Array<{ url: string; name?: string }>
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await LocationService.addLocation(name, latitude, longitude, webcamUrls);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      setIsLoading(true);
      setError(null);
      await LocationService.updateLocation(id, updates);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await LocationService.deleteLocation(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reorderLocations = async (locationIds: string[]) => {
    try {
      await LocationService.reorderLocations(locationIds);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    locations: locations || [],
    isLoading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    reorderLocations,
  };
};
