import { PrismaClient, Place } from '@prisma/client';
import { getPrismaClient } from '../config/database.js';
import { CreatePlaceDto, UpdatePlaceDto } from '../types/index.js';

export class PlaceRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Find all places
   */
  async findAll(): Promise<Place[]> {
    return this.prisma.place.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find all places with space counts
   */
  async findAllWithSpaceCount(): Promise<(Place & { _count: { spaces: number } })[]> {
    return this.prisma.place.findMany({
      include: {
        _count: {
          select: { spaces: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find place by ID
   */
  async findById(id: string): Promise<Place | null> {
    return this.prisma.place.findUnique({
      where: { id },
    });
  }

  /**
   * Find place by ID with spaces
   */
  async findByIdWithSpaces(id: string): Promise<(Place & { spaces: { id: string; name: string; capacity: number }[] }) | null> {
    return this.prisma.place.findUnique({
      where: { id },
      include: {
        spaces: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
      },
    });
  }

  /**
   * Create a new place
   */
  async create(data: CreatePlaceDto): Promise<Place> {
    return this.prisma.place.create({
      data: {
        name: data.name,
        location: data.location,
      },
    });
  }

  /**
   * Update a place
   */
  async update(id: string, data: UpdatePlaceDto): Promise<Place> {
    return this.prisma.place.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a place
   */
  async delete(id: string): Promise<Place> {
    return this.prisma.place.delete({
      where: { id },
    });
  }

  /**
   * Check if place exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.place.count({
      where: { id },
    });
    return count > 0;
  }
}

// Singleton instance
export const placeRepository = new PlaceRepository();
