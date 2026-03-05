// Webcam Search Service
// Searches for public webcams near given coordinates using multiple sources

interface WebcamResult {
  url: string;
  name: string;
  source: string;
  distance?: number;
}

export class WebcamSearchService {
  /**
   * Search for webcams near the given coordinates
   * Uses multiple strategies:
   * 1. Windy Webcams API (if available)
   * 2. Pattern-based URL generation for common sources
   * 3. Suggested search queries
   */
  static async searchNearbyWebcams(
    lat: number,
    lon: number,
    locationName: string
  ): Promise<{
    webcams: WebcamResult[];
    suggestions: string[];
  }> {
    const webcams: WebcamResult[] = [];
    const suggestions: string[] = [];

    // Generate search suggestions based on location
    suggestions.push(
      `${locationName} webcam live`,
      `${locationName} traffic camera`,
      `${locationName} live cam`,
      `${locationName} weather camera`,
      `${locationName} beach cam`,
      `${locationName} city view webcam`
    );

    // Try Windy Webcams API (requires API key - optional)
    try {
      const windyWebcams = await this.searchWindyWebcams(lat, lon);
      webcams.push(...windyWebcams);
    } catch (error) {
      console.log('Windy webcams not available:', error);
    }

    return { webcams, suggestions };
  }

  /**
   * Search Windy Webcams API
   * Note: Requires VITE_WINDY_API_KEY in .env
   * Get free key at: https://api.windy.com/webcams/docs
   */
  private static async searchWindyWebcams(
    lat: number,
    lon: number
  ): Promise<WebcamResult[]> {
    const apiKey = import.meta.env.VITE_WINDY_API_KEY;
    if (!apiKey || apiKey === '') {
      return [];
    }

    const radius = 50; // 50km radius
    const url = `https://api.windy.com/api/webcams/v2/list/nearby=${lat},${lon},${radius}?show=webcams:image,location&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Windy API request failed');
      }

      const data = await response.json();
      
      if (!data.result?.webcams) {
        return [];
      }

      return data.result.webcams.map((cam: any) => ({
        url: cam.image.current.preview,
        name: cam.title || 'Webcam',
        source: 'Windy Webcams',
        distance: this.calculateDistance(
          lat,
          lon,
          cam.location.latitude,
          cam.location.longitude
        ),
      }));
    } catch (error) {
      console.error('Error fetching Windy webcams:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates in km
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Generate common webcam URL patterns for a city/location
   * These are educated guesses based on common patterns
   */
  static generateCommonPatterns(_locationName: string): string[] {
    const patterns: string[] = [];
    // const citySlug = _locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Note: These are example patterns - actual URLs need to be discovered manually
    // This just helps users know what to look for
    // Future: Could add common webcam URL patterns here
    
    return patterns;
  }

  /**
   * Validate if a URL looks like a webcam image URL
   */
  static isValidWebcamUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.toLowerCase();
      
      // Check for image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const hasImageExtension = imageExtensions.some(ext => path.endsWith(ext));
      
      // Check for webcam-related keywords
      const webcamKeywords = ['webcam', 'camera', 'cam', 'live', 'snapshot'];
      const hasWebcamKeyword = webcamKeywords.some(keyword => 
        url.toLowerCase().includes(keyword)
      );
      
      return hasImageExtension || hasWebcamKeyword;
    } catch {
      return false;
    }
  }
}
