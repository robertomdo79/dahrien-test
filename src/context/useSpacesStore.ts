import { create } from 'zustand';
import { spacesService } from '@/services';
import type { Space, SpaceFilters, PaginationMeta } from '@/types';

interface SpacesState {
  spaces: Space[];
  selectedSpace: Space | null;
  pagination: PaginationMeta | null;
  filters: SpaceFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSpaces: (filters?: SpaceFilters) => Promise<void>;
  fetchSpaceById: (id: string) => Promise<void>;
  setFilters: (filters: SpaceFilters) => void;
  clearSelectedSpace: () => void;
  reset: () => void;
}

const initialState = {
  spaces: [],
  selectedSpace: null,
  pagination: null,
  filters: { page: 1, pageSize: 12 },
  isLoading: false,
  error: null,
};

export const useSpacesStore = create<SpacesState>((set, get) => ({
  ...initialState,

  fetchSpaces: async (filters?: SpaceFilters) => {
    const currentFilters = filters || get().filters;
    set({ isLoading: true, error: null, filters: currentFilters });
    
    try {
      const response = await spacesService.getAll(currentFilters);
      set({ 
        spaces: response.data, 
        pagination: response.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch spaces',
        isLoading: false 
      });
    }
  },

  fetchSpaceById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const space = await spacesService.getById(id);
      set({ selectedSpace: space, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch space',
        isLoading: false 
      });
    }
  },

  setFilters: (filters: SpaceFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearSelectedSpace: () => {
    set({ selectedSpace: null });
  },

  reset: () => {
    set(initialState);
  },
}));
