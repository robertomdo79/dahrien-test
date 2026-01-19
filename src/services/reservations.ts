import api from './api';
import type { 
  Reservation, 
  CreateReservationDto, 
  UpdateReservationDto, 
  ReservationFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationMeta
} from '@/types';

const ENDPOINT = '/api/reservations';

// Response type from the actual API
interface ReservationsApiResponse {
  success: boolean;
  data: Reservation[];
  pagination: PaginationMeta;
}

export const reservationsService = {
  /**
   * Get all reservations with optional filters and pagination
   */
  async getAll(filters?: ReservationFilters): Promise<PaginatedResponse<Reservation>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.spaceId) params.append('spaceId', filters.spaceId);
    if (filters?.placeId) params.append('placeId', filters.placeId);
    if (filters?.clientEmail) params.append('clientEmail', filters.clientEmail);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await api.get<ReservationsApiResponse>(
      `${ENDPOINT}?${params.toString()}`
    );
    
    // The API returns { success, data: Reservation[], pagination }
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  },

  /**
   * Get a reservation by ID
   */
  async getById(id: string): Promise<Reservation> {
    const response = await api.get<ApiResponse<Reservation>>(`${ENDPOINT}/${id}`);
    if (!response.data.data) {
      throw new Error('Reservation not found');
    }
    return response.data.data;
  },

  /**
   * Create a new reservation
   */
  async create(data: CreateReservationDto): Promise<Reservation> {
    const response = await api.post<ApiResponse<Reservation>>(ENDPOINT, data);
    if (!response.data.data) {
      throw new Error('Failed to create reservation');
    }
    return response.data.data;
  },

  /**
   * Update a reservation
   */
  async update(id: string, data: UpdateReservationDto): Promise<Reservation> {
    const response = await api.put<ApiResponse<Reservation>>(`${ENDPOINT}/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update reservation');
    }
    return response.data.data;
  },

  /**
   * Cancel a reservation (soft delete)
   */
  async cancel(id: string): Promise<Reservation> {
    const response = await api.patch<ApiResponse<Reservation>>(`${ENDPOINT}/${id}/cancel`);
    if (!response.data.data) {
      throw new Error('Failed to cancel reservation');
    }
    return response.data.data;
  },

  /**
   * Delete a reservation (hard delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
