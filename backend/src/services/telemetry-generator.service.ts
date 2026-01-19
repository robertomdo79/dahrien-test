import { spaceRepository, telemetryRepository } from '../repositories/index.js';
import { logger } from '../utils/logger.js';

/**
 * Telemetry Generator Service
 * Generates realistic IoT sensor data for all active spaces
 */
export class TelemetryGeneratorService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private intervalMs: number;

  constructor(intervalMinutes: number = 30) {
    this.intervalMs = intervalMinutes * 60 * 1000;
  }

  /**
   * Generate realistic telemetry data for a space
   * Simulates IoT sensor readings with natural variations
   */
  private generateTelemetryData() {
    // Base values with realistic office environment ranges
    const baseTemperature = 22; // Celsius (ideal office temp)
    const baseHumidity = 50;    // Percentage (ideal range 40-60%)
    const baseCo2 = 600;        // ppm (outdoor is ~400, good indoor <1000)
    
    // Add natural variations
    const temperatureVariation = (Math.random() - 0.5) * 6; // ±3°C variation
    const humidityVariation = (Math.random() - 0.5) * 30;   // ±15% variation
    const co2Variation = (Math.random() - 0.3) * 600;       // Skewed higher for occupied rooms
    
    // Time-based factors (simulate occupancy patterns)
    const hour = new Date().getHours();
    const isWorkHours = hour >= 8 && hour <= 18;
    const occupancyFactor = isWorkHours ? 1 + Math.random() * 0.5 : 0.3 + Math.random() * 0.3;
    
    // Calculate final values with bounds
    const temperature = Math.max(16, Math.min(30, baseTemperature + temperatureVariation));
    const humidity = Math.max(20, Math.min(80, baseHumidity + humidityVariation));
    const co2 = Math.max(400, Math.min(2000, baseCo2 + co2Variation * occupancyFactor));
    
    // People count based on occupancy factor (0-15 people typical for meeting rooms)
    const maxPeople = Math.floor(5 + Math.random() * 10);
    const peopleCount = isWorkHours 
      ? Math.floor(Math.random() * maxPeople * occupancyFactor)
      : Math.floor(Math.random() * 2);
    
    // Battery level (slowly decreasing with occasional full charge)
    const battery = Math.random() > 0.1 
      ? 60 + Math.random() * 40  // Most readings 60-100%
      : 20 + Math.random() * 30; // Occasional low battery 20-50%

    return {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      co2: Math.round(co2),
      peopleCount,
      battery: Math.round(battery),
      timestamp: new Date(),
    };
  }

  /**
   * Generate telemetry for all active spaces
   */
  async generateForAllSpaces(): Promise<{ success: number; failed: number }> {
    const startTime = Date.now();
    let success = 0;
    let failed = 0;

    try {
      // Get all active spaces
      const { data: spaces } = await spaceRepository.findAll(undefined, { isActive: true });
      
      if (spaces.length === 0) {
        logger.info('No active spaces found for telemetry generation');
        return { success: 0, failed: 0 };
      }

      logger.info(`Generating telemetry for ${spaces.length} spaces...`);

      // Generate telemetry for each space
      const promises = spaces.map(async (space) => {
        try {
          const telemetryData = this.generateTelemetryData();
          
          await telemetryRepository.create({
            placeId: space.placeId,
            spaceId: space.id,
            ...telemetryData,
          });
          
          return { success: true, spaceId: space.id };
        } catch (error) {
          logger.error(`Failed to generate telemetry for space ${space.id}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return { success: false, spaceId: space.id };
        }
      });

      const results = await Promise.all(promises);
      success = results.filter(r => r.success).length;
      failed = results.filter(r => !r.success).length;

      const duration = Date.now() - startTime;
      logger.info(`Telemetry generation completed`, {
        success,
        failed,
        totalSpaces: spaces.length,
        durationMs: duration,
      });

    } catch (error) {
      logger.error('Telemetry generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }

    return { success, failed };
  }

  /**
   * Start the periodic telemetry generation
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Telemetry generator is already running');
      return;
    }

    logger.info(`Starting telemetry generator (interval: ${this.intervalMs / 60000} minutes)`);
    this.isRunning = true;

    // Generate immediately on start
    this.generateForAllSpaces().catch(error => {
      logger.error('Initial telemetry generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    });

    // Set up periodic generation
    this.intervalId = setInterval(async () => {
      try {
        await this.generateForAllSpaces();
      } catch (error) {
        logger.error('Scheduled telemetry generation failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, this.intervalMs);

    logger.info('Telemetry generator started successfully');
  }

  /**
   * Stop the periodic telemetry generation
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn('Telemetry generator is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.info('Telemetry generator stopped');
  }

  /**
   * Check if the generator is running
   */
  getStatus(): { isRunning: boolean; intervalMinutes: number } {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMs / 60000,
    };
  }

  /**
   * Update the interval (requires restart to take effect)
   */
  setInterval(minutes: number): void {
    this.intervalMs = minutes * 60 * 1000;
    logger.info(`Telemetry generator interval updated to ${minutes} minutes`);
    
    // If running, restart with new interval
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
}

// Singleton instance with 30 minute interval
export const telemetryGeneratorService = new TelemetryGeneratorService(30);
