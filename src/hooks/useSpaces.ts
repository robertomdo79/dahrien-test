import { useEffect, useCallback, useRef } from 'react';
import { useSpacesStore } from '@/context';
import type { SpaceFilters, CreateSpaceDto, UpdateSpaceDto } from '@/types';

interface UseSpacesOptions {
  autoFetch?: boolean;
  filters?: SpaceFilters;
}

export function useSpaces(options: UseSpacesOptions = {}) {
  const { autoFetch = true, filters: initialFilters } = options;
  const hasFetched = useRef(false);
  
  const {
    spaces,
    selectedSpace,
    pagination,
    filters,
    isLoading,
    isSubmitting,
    error,
    fetchSpaces,
    fetchSpaceById,
    createSpace,
    updateSpace,
    deleteSpace,
    setFilters,
    clearSelectedSpace,
    reset,
  } = useSpacesStore();

  // Auto-fetch on mount if enabled (only once)
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      fetchSpaces(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    fetchSpaces({ ...filters, page });
  }, [filters, fetchSpaces]);

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
  const filterByPlace = useCallback((placeId: string | undefined) => {
    fetchSpaces({ ...filters, placeId, page: 1 });
  }, [filters, fetchSpaces]);

  const filterByStatus = useCallback((isActive: boolean | undefined) => {
    fetchSpaces({ ...filters, isActive, page: 1 });
  }, [filters, fetchSpaces]);

  const refetch = useCallback(() => {
    fetchSpaces(filters);
  }, [filters, fetchSpaces]);

  // Create space with callback
  const submitSpace = useCallback(async (data: CreateSpaceDto) => {
    return await createSpace(data);
  }, [createSpace]);

  // Update space with callback
  const submitUpdateSpace = useCallback(async (id: string, data: UpdateSpaceDto) => {
    return await updateSpace(id, data);
  }, [updateSpace]);

  // Delete space with callback
  const submitDeleteSpace = useCallback(async (id: string) => {
    return await deleteSpace(id);
  }, [deleteSpace]);

  return {
    // Data
    spaces,
    selectedSpace,
    pagination,
    filters,
    
    // State
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    fetchSpaces,
    fetchSpaceById,
    createSpace: submitSpace,
    updateSpace: submitUpdateSpace,
    deleteSpace: submitDeleteSpace,
    setFilters,
    clearSelectedSpace,
    reset,
    refetch,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Filters
    filterByPlace,
    filterByStatus,
  };
}
