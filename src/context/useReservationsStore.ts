import { create } from 'zustand';
import { reservationsService } from '@/services';
import type { Reservation, ReservationFilters, CreateReservationDto, PaginationMeta } from '@/types';
import toast from 'react-hot-toast';

interface ReservationsState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  pagination: PaginationMeta | null;
  filters: ReservationFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  fetchReservations: (filters?: ReservationFilters) => Promise<void>;
  fetchReservationById: (id: string) => Promise<void>;
  createReservation: (data: CreateReservationDto) => Promise<Reservation | null>;
  cancelReservation: (id: string) => Promise<boolean>;
  deleteReservation: (id: string) => Promise<boolean>;
  setFilters: (filters: ReservationFilters) => void;
  clearSelectedReservation: () => void;
  reset: () => void;
}

const initialState = {
  reservations: [],
  selectedReservation: null,
  pagination: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useReservationsStore = create<ReservationsState>((set, get) => ({
  ...initialState,

  fetchReservations: async (filters?: ReservationFilters) => {
    const currentFilters = filters || get().filters;
    set({ isLoading: true, error: null, filters: currentFilters });
    
    try {
      const response = await reservationsService.getAll(currentFilters);
      set({ 
        reservations: response.data, 
        pagination: response.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reservations',
        isLoading: false 
      });
    }
  },

  fetchReservationById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const reservation = await reservationsService.getById(id);
      set({ selectedReservation: reservation, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reservation',
        isLoading: false 
      });
    }
  },

  createReservation: async (data: CreateReservationDto) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const reservation = await reservationsService.create(data);
      toast.success('Reservation created successfully!');
      
      // Refresh the list
      await get().fetchReservations();
      
      set({ isSubmitting: false });
      return reservation;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create reservation',
        isSubmitting: false 
      });
      return null;
    }
  },

  cancelReservation: async (id: string) => {
    set({ isSubmitting: true, error: null });
    
    try {
      await reservationsService.cancel(id);
      toast.success('Reservation cancelled successfully');
      
      // Refresh the list
      await get().fetchReservations();
      
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to cancel reservation',
        isSubmitting: false 
      });
      return false;
    }
  },

  deleteReservation: async (id: string) => {
    set({ isSubmitting: true, error: null });
    
    try {
      await reservationsService.delete(id);
      toast.success('Reservation deleted permanently');
      
      // Refresh the list
      await get().fetchReservations();
      
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete reservation',
        isSubmitting: false 
      });
      toast.error('Failed to delete reservation');
      return false;
    }
  },

  setFilters: (filters: ReservationFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearSelectedReservation: () => {
    set({ selectedReservation: null });
  },

  reset: () => {
    set(initialState);
  },
}));
