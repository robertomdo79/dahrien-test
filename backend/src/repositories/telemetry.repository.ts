import { PrismaClient, Telemetry } from '@prisma/client';
import { getPrismaClient } from '../config/database.js';
import { TelemetryData } from '../types/index.js';

export class TelemetryRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Store telemetry data from MQTT
   */
  async create(data: TelemetryData & { placeId: string; spaceId: string }): Promise<Telemetry> {
    return this.prisma.telemetry.create({
      data: {
        placeId: data.placeId,
        spaceId: data.spaceId,
        peopleCount: data.peopleCount,
        co2: data.co2,
        humidity: data.humidity,
        temperature: data.temperature,
        battery: data.battery,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        rawData: data as object,
      },
    });
  }

  /**
   * Get latest telemetry for a space
   */
  async getLatestForSpace(spaceId: string): Promise<Telemetry | null> {
    return this.prisma.telemetry.findFirst({
      where: { spaceId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get telemetry history for a space
   */
  async getHistoryForSpace(
    spaceId: string,
    options?: {
      from?: Date;
      to?: Date;
      limit?: number;
    }
  ): Promise<Telemetry[]> {
    return this.prisma.telemetry.findMany({
      where: {
        spaceId,
        ...(options?.from || options?.to
          ? {
              timestamp: {
                ...(options?.from && { gte: options.from }),
                ...(options?.to && { lte: options.to }),
              },
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
    });
  }

  /**
   * Get latest telemetry for all spaces in a place
   */
  async getLatestForPlace(placeId: string): Promise<Telemetry[]> {
    // Using raw query for efficient "latest per group" query
    const spaces = await this.prisma.space.findMany({
      where: { placeId },
      select: { id: true },
    });

    const results = await Promise.all(
      spaces.map((space) => this.getLatestForSpace(space.id))
    );

    return results.filter((t): t is Telemetry => t !== null);
  }

  /**
   * Delete old telemetry data (for cleanup)
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.telemetry.deleteMany({
      where: {
        timestamp: { lt: date },
      },
    });
    return result.count;
  }
}

// Singleton instance
export const telemetryRepository = new TelemetryRepository();
