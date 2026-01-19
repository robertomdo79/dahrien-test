import { SpaceRepository, spaceRepository, PlaceRepository, placeRepository } from '../repositories/index.js';
import { 
  CreateSpaceDto, 
  UpdateSpaceDto, 
  SpaceResponse, 
  PaginationParams,
  PaginatedResponse 
} from '../types/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class SpaceService {
  constructor(
    private repository: SpaceRepository = spaceRepository,
    private placeRepo: PlaceRepository = placeRepository
  ) {}

  /**
   * Get all spaces with pagination
   */
  async getAllSpaces(
    page?: number,
    pageSize?: number,
    filters?: { placeId?: string; isActive?: boolean }
  ): Promise<PaginatedResponse<SpaceResponse>> {
    const pagination: PaginationParams = {
      page: page || config.pagination.defaultPage,
      pageSize: Math.min(
        pageSize || config.pagination.defaultPageSize,
        config.pagination.maxPageSize
      ),
    };

    logger.debug('Fetching spaces', { pagination, filters });

    const { data, total } = await this.repository.findAll(pagination, filters);

    const totalPages = Math.ceil(total / pagination.pageSize);

    return {
      data: data.map((space) => this.mapToResponse(space)),
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  /**
   * Get space by ID
   */
  async getSpaceById(id: string): Promise<SpaceResponse> {
    logger.debug(`Fetching space with id: ${id}`);

    const space = await this.repository.findById(id);

    if (!space) {
      throw new NotFoundError('Space', id);
    }

    return this.mapToResponse(space);
  }

  /**
   * Create a new space
   */
  async createSpace(data: CreateSpaceDto): Promise<SpaceResponse> {
    logger.info('Creating new space', { name: data.name, placeId: data.placeId });

    // Validate that place exists
    const placeExists = await this.placeRepo.exists(data.placeId);
    if (!placeExists) {
      throw new BadRequestError(`Place with id '${data.placeId}' does not exist`);
    }

    // Validate capacity
    if (data.capacity <= 0) {
      throw new BadRequestError('Capacity must be a positive number');
    }

    const space = await this.repository.create(data);

    logger.info(`Space created with id: ${space.id}`);

    return this.mapToResponse(space);
  }

  /**
   * Update a space
   */
  async updateSpace(id: string, data: UpdateSpaceDto): Promise<SpaceResponse> {
    logger.info(`Updating space with id: ${id}`);

    // Check if space exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Space', id);
    }

    // Validate capacity if provided
    if (data.capacity !== undefined && data.capacity <= 0) {
      throw new BadRequestError('Capacity must be a positive number');
    }

    const space = await this.repository.update(id, data);

    logger.info(`Space updated: ${space.id}`);

    return this.mapToResponse(space);
  }

  /**
   * Delete a space
   */
  async deleteSpace(id: string): Promise<void> {
    logger.info(`Deleting space with id: ${id}`);

    // Check if space exists
    const exists = await this.repository.exists(id);
    if (!exists) {
      throw new NotFoundError('Space', id);
    }

    await this.repository.delete(id);

    logger.info(`Space deleted: ${id}`);
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponse(space: {
    id: string;
    placeId: string;
    name: string;
    reference: string | null;
    capacity: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    place?: { id: string; name: string };
  }): SpaceResponse {
    return {
      id: space.id,
      placeId: space.placeId,
      name: space.name,
      reference: space.reference,
      capacity: space.capacity,
      description: space.description,
      isActive: space.isActive,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
      place: space.place,
    };
  }
}

// Singleton instance
export const spaceService = new SpaceService();
