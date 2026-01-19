import { useEffect, useCallback, useState } from 'react';
import { useTelemetryStore } from '@/context';

interface UseIoTOptions {
  spaceId?: string;
  placeId?: string;
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useIoT(options: UseIoTOptions = {}) {
  const { 
    spaceId, 
    placeId, 
    autoFetch = true, 
    refreshInterval = 30000 // Default 30 seconds
  } = options;
  
  const [isPolling, setIsPolling] = useState(false);
  
  const {
    telemetry,
    latestBySpace,
    isLoading,
    error,
    fetchLatestBySpace,
    fetchLatestByPlace,
    fetchHistoryBySpace,
    reset,
  } = useTelemetryStore();

  // Get latest telemetry for a specific space
  const getLatestForSpace = useCallback((id: string) => {
    return latestBySpace.get(id) || null;
  }, [latestBySpace]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      if (spaceId) {
        fetchLatestBySpace(spaceId);
      } else if (placeId) {
        fetchLatestByPlace(placeId);
      }
    }
  }, [autoFetch, spaceId, placeId, fetchLatestBySpace, fetchLatestByPlace]);

  // Polling for real-time updates
  useEffect(() => {
    if (!isPolling || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (spaceId) {
        fetchLatestBySpace(spaceId);
      } else if (placeId) {
        fetchLatestByPlace(placeId);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isPolling, refreshInterval, spaceId, placeId, fetchLatestBySpace, fetchLatestByPlace]);

  // Start/stop polling
  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  // Refresh data manually
  const refresh = useCallback(() => {
    if (spaceId) {
      fetchLatestBySpace(spaceId);
    } else if (placeId) {
      fetchLatestByPlace(placeId);
    }
  }, [spaceId, placeId, fetchLatestBySpace, fetchLatestByPlace]);

  // Helper to determine sensor status based on values
  const getSensorStatus = useCallback((telemetryData: typeof telemetry[0] | null) => {
    if (!telemetryData) return 'unknown';

    const checks = {
      temperature: telemetryData.temperature !== null && 
        telemetryData.temperature >= 18 && 
        telemetryData.temperature <= 26,
      humidity: telemetryData.humidity !== null && 
        telemetryData.humidity >= 30 && 
        telemetryData.humidity <= 70,
      co2: telemetryData.co2 !== null && 
        telemetryData.co2 < 1000,
      battery: telemetryData.battery !== null && 
        telemetryData.battery > 20,
    };

    const failedChecks = Object.values(checks).filter(v => !v).length;
    
    if (failedChecks === 0) return 'good';
    if (failedChecks <= 1) return 'warning';
    return 'critical';
  }, []);

  return {
    // Data
    telemetry,
    latestBySpace,
    
    // State
    isLoading,
    error,
    isPolling,
    
    // Actions
    fetchLatestBySpace,
    fetchLatestByPlace,
    fetchHistoryBySpace,
    reset,
    refresh,
    
    // Polling controls
    startPolling,
    stopPolling,
    
    // Helpers
    getLatestForSpace,
    getSensorStatus,
  };
}
