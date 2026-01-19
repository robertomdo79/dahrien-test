import { create } from 'zustand';
import { placesService } from '@/services';
import type { Place } from '@/types';

interface PlacesState {
  places: Place[];
  selectedPlace: Place | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPlaces: () => Promise<void>;
  fetchPlaceById: (id: string) => Promise<void>;
  setSelectedPlace: (place: Place | null) => void;
  reset: () => void;
}

const initialState = {
  places: [],
  selectedPlace: null,
  isLoading: false,
  error: null,
};

export const usePlacesStore = create<PlacesState>((set) => ({
  ...initialState,

  fetchPlaces: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const places = await placesService.getAll();
      set({ places, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch places',
        isLoading: false 
      });
    }
  },

  fetchPlaceById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const place = await placesService.getById(id);
      set({ selectedPlace: place, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch place',
        isLoading: false 
      });
    }
  },

  setSelectedPlace: (place: Place | null) => {
    set({ selectedPlace: place });
  },

  reset: () => {
    set(initialState);
  },
}));
