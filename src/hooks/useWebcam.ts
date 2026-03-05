import { useState, useEffect, useCallback } from 'react';
import { WebcamService } from '@/services/WebcamService';

export const useWebcam = (url: string, refreshInterval: number = 15 * 60 * 1000) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchImage = useCallback(async () => {
    if (!url) return;

    try {
      setIsLoading(true);
      setError(null);
      const newImageUrl = await WebcamService.getWebcamImageUrl(url);
      
      // Revoke old blob URL to prevent memory leak
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      setImageUrl(newImageUrl);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching webcam image:', err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchImage();

    // Set up auto-refresh
    const interval = setInterval(fetchImage, refreshInterval);

    // Refresh when app comes back into focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchImage();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Cleanup blob URL on unmount
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [fetchImage, refreshInterval]);

  const refresh = () => {
    fetchImage();
  };

  return {
    imageUrl,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
};
