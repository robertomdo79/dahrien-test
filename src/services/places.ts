import api from './api';
import type { 
  Place, 
  CreatePlaceDto, 
  UpdatePlaceDto, 
  ApiResponse 
} from '@/types';

const ENDPOINT = '/api/places';

// Response type from the actual API
interface PlacesApiResponse {
  success: boolean;
  data: Place[];
}

export const placesService = {
  /**
   * Get all places
   */
  async getAll(): Promise<Place[]> {
    const response = await api.get<PlacesApiResponse>(ENDPOINT);
    return response.data.data || [];
  },

  /**
   * Get a place by ID
   */
  async getById(id: string): Promise<Place> {
    const response = await api.get<ApiResponse<Place>>(`${ENDPOINT}/${id}`);
    if (!response.data.data) {
      throw new Error('Place not found');
    }
    return response.data.data;
  },

  /**
   * Create a new place
   */
  async create(data: CreatePlaceDto): Promise<Place> {
    const response = await api.post<ApiResponse<Place>>(ENDPOINT, data);
    if (!response.data.data) {
      throw new Error('Failed to create place');
    }
    return response.data.data;
  },

  /**
   * Update a place
   */
  async update(id: string, data: UpdatePlaceDto): Promise<Place> {
    const response = await api.put<ApiResponse<Place>>(`${ENDPOINT}/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update place');
    }
    return response.data.data;
  },

  /**
   * Delete a place
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
