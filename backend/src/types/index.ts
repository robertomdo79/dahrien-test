import { Request } from 'express';

// ============================================
// Common Types
// ============================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================
// Place Types
// ============================================

export interface CreatePlaceDto {
  name: string;
  location: string;
}

export interface UpdatePlaceDto {
  name?: string;
  location?: string;
}

export interface PlaceResponse {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  spacesCount?: number;
}

// ============================================
// Space Types
// ============================================

export interface CreateSpaceDto {
  placeId: string;
  name: string;
  reference?: string;
  capacity: number;
  description?: string;
}

export interface UpdateSpaceDto {
  name?: string;
  reference?: string;
  capacity?: number;
  description?: string;
  isActive?: boolean;
}

export interface SpaceResponse {
  id: string;
  placeId: string;
  name: string;
  reference: string | null;
  capacity: number;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  place?: {
    id: string;
    name: string;
  };
}

// ============================================
// Reservation Types
// ============================================

export interface CreateReservationDto {
  spaceId: string;
  clientEmail: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // ISO datetime or time string
  endTime: string; // ISO datetime or time string
  notes?: string;
}

export interface UpdateReservationDto {
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface ReservationResponse {
  id: string;
  spaceId: string;
  placeId: string;
  clientEmail: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  space?: {
    id: string;
    name: string;
    capacity: number;
  };
  place?: {
    id: string;
    name: string;
  };
}

export interface ReservationFilters {
  spaceId?: string;
  placeId?: string;
  clientEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: ReservationStatus;
}

// ============================================
// Telemetry Types (IoT)
// ============================================

export interface TelemetryData {
  site: string; // Maps to placeId
  office: string; // Maps to spaceId
  peopleCount?: number;
  co2?: number;
  humidity?: number;
  temperature?: number;
  battery?: number;
  timestamp?: string;
}

export interface TelemetryResponse {
  id: string;
  placeId: string;
  spaceId: string;
  peopleCount: number | null;
  co2: number | null;
  humidity: number | null;
  temperature: number | null;
  battery: number | null;
  timestamp: Date;
}

// ============================================
// Express Extended Types
// ============================================

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}
