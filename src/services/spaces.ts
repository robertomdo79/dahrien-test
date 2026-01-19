import api from './api';
import type { 
  Space, 
  CreateSpaceDto, 
  UpdateSpaceDto, 
  SpaceFilters,
  PaginatedResponse,
  ApiResponse,
  PaginationMeta
} from '@/types';

const ENDPOINT = '/api/spaces';

// Response type from the actual API
interface SpacesApiResponse {
  success: boolean;
  data: Space[];
  pagination: PaginationMeta;
}

export const spacesService = {
  /**
   * Get all spaces with optional filters and pagination
   */
  async getAll(filters?: SpaceFilters): Promise<PaginatedResponse<Space>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.placeId) params.append('placeId', filters.placeId);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await api.get<SpacesApiResponse>(
      `${ENDPOINT}?${params.toString()}`
    );
    
    // The API returns { success, data: Space[], pagination }
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
   * Get a space by ID
   */
  async getById(id: string): Promise<Space> {
    const response = await api.get<ApiResponse<Space>>(`${ENDPOINT}/${id}`);
    if (!response.data.data) {
      throw new Error('Space not found');
    }
    return response.data.data;
  },

  /**
   * Create a new space
   */
  async create(data: CreateSpaceDto): Promise<Space> {
    const response = await api.post<ApiResponse<Space>>(ENDPOINT, data);
    if (!response.data.data) {
      throw new Error('Failed to create space');
    }
    return response.data.data;
  },

  /**
   * Update a space
   */
  async update(id: string, data: UpdateSpaceDto): Promise<Space> {
    const response = await api.put<ApiResponse<Space>>(`${ENDPOINT}/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update space');
    }
    return response.data.data;
  },

  /**
   * Delete a space
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
