// ============================================
// Common Types
// ============================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
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

export interface Place {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  spacesCount?: number;
}

export interface CreatePlaceDto {
  name: string;
  location: string;
}

export interface UpdatePlaceDto {
  name?: string;
  location?: string;
}

// ============================================
// Space Types
// ============================================

export interface Space {
  id: string;
  placeId: string;
  name: string;
  reference: string | null;
  capacity: number;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  place?: {
    id: string;
    name: string;
  };
}

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

export interface SpaceFilters extends PaginationParams {
  placeId?: string;
  isActive?: boolean;
}

// ============================================
// Reservation Types
// ============================================

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  spaceId: string;
  placeId: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface CreateReservationDto {
  spaceId: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  notes?: string;
}

export interface UpdateReservationDto {
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface ReservationFilters extends PaginationParams {
  spaceId?: string;
  placeId?: string;
  clientEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ReservationStatus;
}

// ============================================
// Telemetry Types (IoT)
// ============================================

export interface Telemetry {
  id: string;
  placeId: string;
  spaceId: string;
  peopleCount: number | null;
  co2: number | null;
  humidity: number | null;
  temperature: number | null;
  battery: number | null;
  timestamp: string;
}

export interface TelemetryFilters extends PaginationParams {
  placeId?: string;
  spaceId?: string;
  from?: string;
  to?: string;
}

// ============================================
// UI State Types
// ============================================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';
