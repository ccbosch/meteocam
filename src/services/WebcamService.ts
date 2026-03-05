import { db } from '@/db/schema';
import { WebcamSnapshot } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class WebcamService {
  static async fetchWebcamImage(url: string): Promise<Blob> {
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch webcam image: ${response.statusText}`);
    }

    return response.blob();
  }

  static async getWebcamImageUrl(url: string): Promise<string> {
    try {
      const blob = await this.fetchWebcamImage(url);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching webcam image:', error);
      throw error;
    }
  }

  static async captureSnapshot(
    locationId: string,
    webcamSourceId: string,
    url: string
  ): Promise<WebcamSnapshot> {
    const imageData = await this.fetchWebcamImage(url);

    const snapshot: WebcamSnapshot = {
      id: uuidv4(),
      locationId,
      webcamSourceId,
      imageData,
      timestamp: new Date(),
    };

    await db.webcamSnapshots.add(snapshot);
    return snapshot;
  }

  static async getSnapshots(
    locationId: string,
    webcamSourceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WebcamSnapshot[]> {
    let query = db.webcamSnapshots
      .where('[locationId+webcamSourceId]')
      .equals([locationId, webcamSourceId]);

    if (startDate || endDate) {
      const snapshots = await query.toArray();
      return snapshots.filter(s => {
        const timestamp = s.timestamp.getTime();
        if (startDate && timestamp < startDate.getTime()) return false;
        if (endDate && timestamp > endDate.getTime()) return false;
        return true;
      });
    }

    return query.toArray();
  }

  static async deleteOldSnapshots(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldSnapshots = await db.webcamSnapshots
      .where('timestamp')
      .below(cutoffDate)
      .toArray();

    await db.webcamSnapshots
      .where('timestamp')
      .below(cutoffDate)
      .delete();

    return oldSnapshots.length;
  }

  static async getSnapshotCount(locationId?: string): Promise<number> {
    if (locationId) {
      return db.webcamSnapshots.where('locationId').equals(locationId).count();
    }
    return db.webcamSnapshots.count();
  }

  static validateWebcamUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static async testWebcamUrl(url: string): Promise<boolean> {
    try {
      await this.fetchWebcamImage(url);
      return true;
    } catch {
      return false;
    }
  }

  // Create timelapse from snapshots
  static async createTimelapse(
    snapshots: WebcamSnapshot[],
    _fps: number = 10
  ): Promise<Blob[]> {
    // Return array of image blobs in order
    return snapshots
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(s => s.imageData);
  }
}
