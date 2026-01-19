import { useEffect, useCallback, useRef } from 'react';
import { usePlacesStore } from '@/context';

interface UsePlacesOptions {
  autoFetch?: boolean;
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const { autoFetch = true } = options;
  const hasFetched = useRef(false);
  
  const {
    places,
    selectedPlace,
    isLoading,
    error,
    fetchPlaces,
    fetchPlaceById,
    setSelectedPlace,
    reset,
  } = usePlacesStore();

  // Auto-fetch on mount if enabled (only once)
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      fetchPlaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const refetch = useCallback(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Get places as options for select components
  const placesOptions = (places || []).map((place) => ({
    value: place.id,
    label: place.name,
  }));

  return {
    // Data
    places,
    selectedPlace,
    placesOptions,
    
    // State
    isLoading,
    error,
    
    // Actions
    fetchPlaces,
    fetchPlaceById,
    setSelectedPlace,
    reset,
    refetch,
  };
}
