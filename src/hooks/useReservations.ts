import { useEffect, useCallback, useRef } from 'react';
import { useReservationsStore } from '@/context';
import type { ReservationFilters, CreateReservationDto } from '@/types';

interface UseReservationsOptions {
  autoFetch?: boolean;
  filters?: ReservationFilters;
}

export function useReservations(options: UseReservationsOptions = {}) {
  const { autoFetch = true, filters: initialFilters } = options;
  const hasFetched = useRef(false);
  
  const {
    reservations,
    selectedReservation,
    pagination,
    filters,
    isLoading,
    isSubmitting,
    error,
    fetchReservations,
    fetchReservationById,
    createReservation,
    cancelReservation,
    deleteReservation,
    setFilters,
    clearSelectedReservation,
    reset,
  } = useReservationsStore();

  // Auto-fetch on mount if enabled (only once)
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      fetchReservations(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    fetchReservations({ ...filters, page });
  }, [filters, fetchReservations]);

  const nextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      goToPage((pagination?.page || 1) + 1);
    }
  }, [pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination?.hasPreviousPage) {
      goToPage((pagination?.page || 1) - 1);
    }
  }, [pagination, goToPage]);

  // Filter helpers
  const filterByEmail = useCallback((clientEmail: string | undefined) => {
    fetchReservations({ ...filters, clientEmail, page: 1 });
  }, [filters, fetchReservations]);

  const filterByStatus = useCallback((status: ReservationFilters['status'] | undefined) => {
    fetchReservations({ ...filters, status, page: 1 });
  }, [filters, fetchReservations]);

  const filterByDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    fetchReservations({ ...filters, dateFrom, dateTo, page: 1 });
  }, [filters, fetchReservations]);

  const filterBySpace = useCallback((spaceId: string | undefined) => {
    fetchReservations({ ...filters, spaceId, page: 1 });
  }, [filters, fetchReservations]);

  const refetch = useCallback(() => {
    fetchReservations(filters);
  }, [filters, fetchReservations]);

  // Create reservation with callback
  const submitReservation = useCallback(async (data: CreateReservationDto) => {
    return await createReservation(data);
  }, [createReservation]);

  return {
    // Data
    reservations,
    selectedReservation,
    pagination,
    filters,
    
    // State
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchReservations,
    fetchReservationById,
    createReservation: submitReservation,
    cancelReservation,
    deleteReservation,
    setFilters,
    clearSelectedReservation,
    reset,
    refetch,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Filters
    filterByEmail,
    filterByStatus,
    filterByDateRange,
    filterBySpace,
  };
}
