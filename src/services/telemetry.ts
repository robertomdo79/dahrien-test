import api from './api';
import type { 
  Telemetry, 
  ApiResponse 
} from '@/types';

const ENDPOINT = '/api/telemetry';

export interface GeneratorStatus {
  isRunning: boolean;
  intervalMinutes: number;
  message: string;
}

export interface GenerateResult {
  message: string;
  spacesUpdated: number;
  spacesFailed: number;
  timestamp: string;
}

export const telemetryService = {
  /**
   * Get latest telemetry for a specific space
   */
  async getLatestBySpace(spaceId: string): Promise<Telemetry | null> {
    try {
      const response = await api.get<ApiResponse<Telemetry>>(
        `${ENDPOINT}/space/${spaceId}/latest`
      );
      return response.data.data || null;
    } catch {
      // Return null if no telemetry found (404 is expected)
      return null;
    }
  },

  /**
   * Get latest telemetry for all spaces in a place
   */
  async getLatestByPlace(placeId: string): Promise<Telemetry[]> {
    try {
      const response = await api.get<ApiResponse<Telemetry[]>>(
        `${ENDPOINT}/place/${placeId}/latest`
      );
      return response.data.data || [];
    } catch {
      // Return empty array if no telemetry found
      return [];
    }
  },

  /**
   * Get telemetry history for a specific space
   */
  async getHistoryBySpace(
    spaceId: string, 
    options?: { from?: string; to?: string; limit?: number }
  ): Promise<Telemetry[]> {
    try {
      const params = new URLSearchParams();
      if (options?.from) params.append('from', options.from);
      if (options?.to) params.append('to', options.to);
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await api.get<ApiResponse<Telemetry[]>>(
        `${ENDPOINT}/space/${spaceId}/history?${params.toString()}`
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Manually trigger telemetry generation for all spaces
   */
  async generateTelemetry(): Promise<GenerateResult> {
    const response = await api.post<ApiResponse<GenerateResult>>(
      `${ENDPOINT}/generate`
    );
    return response.data.data!;
  },

  /**
   * Get telemetry generator status
   */
  async getGeneratorStatus(): Promise<GeneratorStatus> {
    const response = await api.get<ApiResponse<GeneratorStatus>>(
      `${ENDPOINT}/generator/status`
    );
    return response.data.data!;
  },

  /**
   * Start the telemetry generator
   */
  async startGenerator(): Promise<GeneratorStatus> {
    const response = await api.post<ApiResponse<GeneratorStatus>>(
      `${ENDPOINT}/generator/start`
    );
    return response.data.data!;
  },

  /**
   * Stop the telemetry generator
   */
  async stopGenerator(): Promise<GeneratorStatus> {
    const response = await api.post<ApiResponse<GeneratorStatus>>(
      `${ENDPOINT}/generator/stop`
    );
    return response.data.data!;
  },
};
