import { PrismaClient, Space } from '@prisma/client';
import { getPrismaClient } from '../config/database.js';
import { CreateSpaceDto, UpdateSpaceDto, PaginationParams } from '../types/index.js';

export interface SpaceWithPlace extends Space {
  place: {
    id: string;
    name: string;
  };
}

export class SpaceRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Find all spaces with pagination
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: { placeId?: string; isActive?: boolean }
  ): Promise<{ data: SpaceWithPlace[]; total: number }> {
    const where = {
      ...(filters?.placeId && { placeId: filters.placeId }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.space.findMany({
        where,
        include: {
          place: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...(pagination && {
          skip: (pagination.page - 1) * pagination.pageSize,
          take: pagination.pageSize,
        }),
      }),
      this.prisma.space.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find space by ID
   */
  async findById(id: string): Promise<SpaceWithPlace | null> {
    return this.prisma.space.findUnique({
      where: { id },
      include: {
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create a new space
   */
  async create(data: CreateSpaceDto): Promise<SpaceWithPlace> {
    return this.prisma.space.create({
      data: {
        placeId: data.placeId,
        name: data.name,
        reference: data.reference,
        capacity: data.capacity,
        description: data.description,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update a space
   */
  async update(id: string, data: UpdateSpaceDto): Promise<SpaceWithPlace> {
    return this.prisma.space.update({
      where: { id },
      data,
      include: {
        place: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a space
   */
  async delete(id: string): Promise<Space> {
    return this.prisma.space.delete({
      where: { id },
    });
  }

  /**
   * Check if space exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.space.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Get space with its place ID (for reservation creation)
   */
  async getSpaceWithPlaceId(id: string): Promise<{ id: string; placeId: string } | null> {
    return this.prisma.space.findUnique({
      where: { id },
      select: {
        id: true,
        placeId: true,
      },
    });
  }
}

// Singleton instance
export const spaceRepository = new SpaceRepository();
