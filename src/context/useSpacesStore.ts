import { create } from 'zustand';
import { spacesService } from '@/services';
import type { Space, SpaceFilters, PaginationMeta, CreateSpaceDto, UpdateSpaceDto } from '@/types';
import toast from 'react-hot-toast';

interface SpacesState {
  spaces: Space[];
  selectedSpace: Space | null;
  pagination: PaginationMeta | null;
  filters: SpaceFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  fetchSpaces: (filters?: SpaceFilters) => Promise<void>;
  fetchSpaceById: (id: string) => Promise<void>;
  createSpace: (data: CreateSpaceDto) => Promise<Space | null>;
  updateSpace: (id: string, data: UpdateSpaceDto) => Promise<Space | null>;
  deleteSpace: (id: string) => Promise<boolean>;
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
  isSubmitting: false,
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

  createSpace: async (data: CreateSpaceDto) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const space = await spacesService.create(data);
      toast.success('Space created successfully!');
      
      // Refresh the list
      await get().fetchSpaces();
      
      set({ isSubmitting: false });
      return space;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create space',
        isSubmitting: false 
      });
      return null;
    }
  },

  updateSpace: async (id: string, data: UpdateSpaceDto) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const space = await spacesService.update(id, data);
      toast.success('Space updated successfully!');
      
      // Refresh the list
      await get().fetchSpaces();
      
      set({ isSubmitting: false });
      return space;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update space',
        isSubmitting: false 
      });
      toast.error('Failed to update space');
      return null;
    }
  },

  deleteSpace: async (id: string) => {
    set({ isSubmitting: true, error: null });
    
    try {
      await spacesService.delete(id);
      toast.success('Space deleted successfully!');
      
      // Refresh the list
      await get().fetchSpaces();
      
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete space',
        isSubmitting: false 
      });
      toast.error('Failed to delete space');
      return false;
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
