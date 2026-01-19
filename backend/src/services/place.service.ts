import { Place } from '@prisma/client';
import { PlaceRepository, placeRepository } from '../repositories/index.js';
import { CreatePlaceDto, UpdatePlaceDto, PlaceResponse } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class PlaceService {
  constructor(private repository: PlaceRepository = placeRepository) {}

  /**
   * Get all places
   */
  async getAllPlaces(): Promise<PlaceResponse[]> {
    logger.debug('Fetching all places');
    
    const places = await this.repository.findAllWithSpaceCount();
    
    return places.map((place) => ({
      id: place.id,
      name: place.name,
      location: place.location,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      spacesCount: place._count.spaces,
    }));
  }

  /**
   * Get place by ID
   */
  async getPlaceById(id: string): Promise<PlaceResponse> {
    logger.debug(`Fetching place with id: ${id}`);
    
    const place = await this.repository.findByIdWithSpaces(id);
    
    if (!place) {
      throw new NotFoundError('Place', id);
    }

    return {
      id: place.id,
      name: place.name,
      location: place.location,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      spacesCount: place.spaces.length,
    };
  }

  /**
   * Create a new place
   */
  async createPlace(data: CreatePlaceDto): Promise<PlaceResponse> {
    logger.info('Creating new place', { name: data.name });
    
    const place = await this.repository.create(data);
    
    logger.info(`Place created with id: ${place.id}`);
    
    return {
      id: place.id,
      name: place.name,
      location: place.location,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
      spacesCount: 0,
    };
  }

  /**
   * Update a place
   */
  async updatePlace(id: string, data: UpdatePlaceDto): Promise<PlaceResponse> {
    logger.info(`Updating place with id: ${id}`);
    
    // Check if place exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Place', id);
    }

    const place = await this.repository.update(id, data);
    
    logger.info(`Place updated: ${place.id}`);
    
    return {
      id: place.id,
      name: place.name,
      location: place.location,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
    };
  }

  /**
   * Delete a place
   */
  async deletePlace(id: string): Promise<void> {
    logger.info(`Deleting place with id: ${id}`);
    
    // Check if place exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Place', id);
    }

    await this.repository.delete(id);
    
    logger.info(`Place deleted: ${id}`);
  }
}

// Singleton instance
export const placeService = new PlaceService();
