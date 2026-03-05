import { db } from '@/db/schema';
import { Location, WebcamSource } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class LocationService {
  static async getAllLocations(): Promise<Location[]> {
    return db.locations.orderBy('order').toArray();
  }

  static async getLocationById(id: string): Promise<Location | undefined> {
    return db.locations.get(id);
  }

  static async addLocation(
    name: string,
    latitude: number,
    longitude: number,
    webcamUrls: Omit<WebcamSource, 'id'>[]
  ): Promise<Location> {
    const locations = await this.getAllLocations();
    const maxOrder = locations.reduce((max, loc) => Math.max(max, loc.order), -1);

    const location: Location = {
      id: uuidv4(),
      name,
      latitude,
      longitude,
      webcamUrls: webcamUrls.map(source => ({
        ...source,
        id: uuidv4(),
      })),
      addedAt: new Date(),
      order: maxOrder + 1,
    };

    await db.locations.add(location);
    return location;
  }

  static async updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    // If updating webcamUrls, ensure all have IDs
    if (updates.webcamUrls) {
      updates.webcamUrls = updates.webcamUrls.map(source => ({
        ...source,
        id: source.id || uuidv4(),
      }));
    }
    await db.locations.update(id, updates);
  }

  static async deleteLocation(id: string): Promise<void> {
    await db.locations.delete(id);
    // Also delete associated weather data and snapshots
    await db.weatherData.where('locationId').equals(id).delete();
    await db.webcamSnapshots.where('locationId').equals(id).delete();
  }

  static async reorderLocations(locationIds: string[]): Promise<void> {
    const updates = locationIds.map((id, index) => ({
      key: id,
      changes: { order: index },
    }));

    await db.locations.bulkUpdate(updates);
  }

  static async addWebcamSource(
    locationId: string,
    source: Omit<WebcamSource, 'id'>
  ): Promise<void> {
    const location = await this.getLocationById(locationId);
    if (!location) throw new Error('Location not found');

    const newSource: WebcamSource = {
      ...source,
      id: uuidv4(),
    };

    location.webcamUrls.push(newSource);
    await db.locations.update(locationId, { webcamUrls: location.webcamUrls });
  }

  static async removeWebcamSource(locationId: string, sourceId: string): Promise<void> {
    const location = await this.getLocationById(locationId);
    if (!location) throw new Error('Location not found');

    location.webcamUrls = location.webcamUrls.filter(source => source.id !== sourceId);
    await db.locations.update(locationId, { webcamUrls: location.webcamUrls });

    // Delete snapshots for this webcam source
    await db.webcamSnapshots
      .where('[locationId+webcamSourceId]')
      .equals([locationId, sourceId])
      .delete();
  }
}
