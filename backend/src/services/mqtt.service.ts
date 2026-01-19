import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { telemetryRepository } from '../repositories/index.js';
import { spaceRepository, placeRepository } from '../repositories/index.js';
import { TelemetryData } from '../types/index.js';

/**
 * MQTT Service for IoT Integration
 * 
 * Handles connection to MQTT broker and processes telemetry data
 * from IoT sensors in co-working spaces.
 * 
 * Topic structure: coworking/{site}/{office}/telemetry
 * - site maps to Place
 * - office maps to Space
 */
export class MqttService {
  private client: MqttClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  // Cache for mapping MQTT identifiers to database IDs
  private placeCache: Map<string, string> = new Map();
  private spaceCache: Map<string, string> = new Map();

  /**
   * Connect to MQTT broker
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn('MQTT client is already connected');
      return;
    }

    const options: IClientOptions = {
      clientId: config.mqtt.clientId,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    };

    // Add credentials if provided
    if (config.mqtt.username) {
      options.username = config.mqtt.username;
    }
    if (config.mqtt.password) {
      options.password = config.mqtt.password;
    }

    logger.info(`Connecting to MQTT broker: ${config.mqtt.brokerUrl}`);

    return new Promise((resolve, reject) => {
      this.client = mqtt.connect(config.mqtt.brokerUrl, options);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info('Connected to MQTT broker');
        
        // Subscribe to telemetry topic
        this.subscribe();
        resolve();
      });

      this.client.on('error', (error) => {
        logger.error('MQTT connection error', { error: error.message });
        if (!this.isConnected) {
          reject(error);
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('MQTT connection closed');
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        logger.info(`MQTT reconnecting... Attempt ${this.reconnectAttempts}`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.error('Max MQTT reconnection attempts reached');
          this.client?.end();
        }
      });

      this.client.on('offline', () => {
        logger.warn('MQTT client offline');
      });

      this.client.on('message', this.handleMessage.bind(this));
    });
  }

  /**
   * Subscribe to telemetry topic
   */
  private subscribe(): void {
    if (!this.client) return;

    const topic = config.mqtt.telemetryTopic;
    
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        logger.error('Failed to subscribe to MQTT topic', { topic, error: err.message });
      } else {
        logger.info(`Subscribed to MQTT topic: ${topic}`);
      }
    });
  }

  /**
   * Handle incoming MQTT message
   */
  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      // Parse topic: coworking/{site}/{office}/telemetry
      const parts = topic.split('/');
      if (parts.length < 4) {
        logger.warn('Invalid MQTT topic format', { topic });
        return;
      }

      const [, site, office] = parts;
      
      // Parse message payload
      let payload: TelemetryData;
      try {
        payload = JSON.parse(message.toString());
      } catch {
        logger.warn('Failed to parse MQTT message as JSON', { topic });
        return;
      }

      logger.debug('Received telemetry data', { site, office, payload });

      // Add site and office to payload
      payload.site = site;
      payload.office = office;

      // Process and store telemetry
      await this.processTelemetry(payload);

    } catch (error) {
      logger.error('Error handling MQTT message', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        topic 
      });
    }
  }

  /**
   * Process and store telemetry data
   * 
   * Maps MQTT site/office identifiers to database Place/Space entities.
   * Creates telemetry record if mapping exists.
   */
  private async processTelemetry(data: TelemetryData): Promise<void> {
    try {
      // Try to resolve Place ID from site name
      let placeId = this.placeCache.get(data.site);
      if (!placeId) {
        // Look up place by name (site is typically the place name)
        const places = await placeRepository.findAll();
        const place = places.find(
          p => p.name.toLowerCase() === data.site.toLowerCase() ||
               p.id === data.site
        );
        
        if (place) {
          placeId = place.id;
          this.placeCache.set(data.site, placeId);
        }
      }

      // Try to resolve Space ID from office name
      let spaceId = this.spaceCache.get(`${data.site}:${data.office}`);
      if (!spaceId && placeId) {
        // Look up space by name within the place
        const { data: spaces } = await spaceRepository.findAll(undefined, { placeId });
        const space = spaces.find(
          s => s.name.toLowerCase() === data.office.toLowerCase() ||
               s.reference?.toLowerCase() === data.office.toLowerCase() ||
               s.id === data.office
        );
        
        if (space) {
          spaceId = space.id;
          this.spaceCache.set(`${data.site}:${data.office}`, spaceId);
        }
      }

      // If we couldn't resolve both IDs, log and skip
      if (!placeId || !spaceId) {
        logger.debug('Could not map MQTT identifiers to database entities', {
          site: data.site,
          office: data.office,
          resolvedPlaceId: placeId,
          resolvedSpaceId: spaceId,
        });
        return;
      }

      // Store telemetry data
      await telemetryRepository.create({
        ...data,
        placeId,
        spaceId,
      });

      logger.debug('Telemetry data stored', {
        placeId,
        spaceId,
        temperature: data.temperature,
        humidity: data.humidity,
        co2: data.co2,
        peopleCount: data.peopleCount,
      });

    } catch (error) {
      logger.error('Error processing telemetry', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
      });
    }
  }

  /**
   * Publish a message to a topic
   */
  async publish(topic: string, message: object): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.publish(
        topic,
        JSON.stringify(message),
        { qos: 1 },
        (err) => {
          if (err) {
            logger.error('Failed to publish MQTT message', { topic, error: err.message });
            reject(err);
          } else {
            logger.debug('Published MQTT message', { topic });
            resolve();
          }
        }
      );
    });
  }

  /**
   * Disconnect from MQTT broker
   */
  async disconnect(): Promise<void> {
    if (!this.client) return;

    return new Promise((resolve) => {
      this.client!.end(false, {}, () => {
        this.isConnected = false;
        this.client = null;
        logger.info('Disconnected from MQTT broker');
        resolve();
      });
    });
  }

  /**
   * Check connection status
   */
  isClientConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Clear caches (useful for testing)
   */
  clearCaches(): void {
    this.placeCache.clear();
    this.spaceCache.clear();
  }
}

// Singleton instance
export const mqttService = new MqttService();
