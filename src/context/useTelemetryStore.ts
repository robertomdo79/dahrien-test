import { create } from 'zustand';
import { telemetryService } from '@/services';
import type { Telemetry } from '@/types';

interface TelemetryState {
  telemetry: Telemetry[];
  latestBySpace: Map<string, Telemetry>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLatestBySpace: (spaceId: string) => Promise<void>;
  fetchLatestByPlace: (placeId: string) => Promise<void>;
  fetchHistoryBySpace: (spaceId: string, options?: { from?: string; to?: string; limit?: number }) => Promise<void>;
  reset: () => void;
}

const initialState = {
  telemetry: [],
  latestBySpace: new Map<string, Telemetry>(),
  isLoading: false,
  error: null,
};

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  ...initialState,

  fetchLatestBySpace: async (spaceId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const telemetry = await telemetryService.getLatestBySpace(spaceId);
      if (telemetry) {
        const newMap = new Map(get().latestBySpace);
        newMap.set(spaceId, telemetry);
        set({ latestBySpace: newMap, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch telemetry',
        isLoading: false 
      });
    }
  },

  fetchLatestByPlace: async (placeId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const telemetryList = await telemetryService.getLatestByPlace(placeId);
      const newMap = new Map(get().latestBySpace);
      
      // Group by space and keep only the latest
      telemetryList.forEach(t => {
        const existing = newMap.get(t.spaceId);
        if (!existing || new Date(t.timestamp) > new Date(existing.timestamp)) {
          newMap.set(t.spaceId, t);
        }
      });
      
      set({ latestBySpace: newMap, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch telemetry',
        isLoading: false 
      });
    }
  },

  fetchHistoryBySpace: async (spaceId: string, options?: { from?: string; to?: string; limit?: number }) => {
    set({ isLoading: true, error: null });
    
    try {
      const telemetryList = await telemetryService.getHistoryBySpace(spaceId, options);
      set({ telemetry: telemetryList, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch telemetry history',
        isLoading: false 
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
