# Workspace Reservation API

A Node.js API for managing reservations in a co-working space with IoT integration for environmental monitoring.

## 🚀 Features

- **Places Management**: CRUD operations for buildings/locations
- **Spaces Management**: CRUD operations for rentable units within places
- **Reservations System**: Full booking system with conflict detection and quota management
- **IoT Integration**: MQTT-based telemetry data collection (temperature, humidity, CO2, people count)
- **API Key Authentication**: Secure access with static API key
- **Pagination**: Efficient data retrieval for large datasets
- **Input Validation**: Comprehensive request validation
- **Global Error Handling**: Standardized error responses

## 📋 Business Rules

1. **Conflict Detection**: Prevents double-booking of spaces for overlapping time slots
2. **Weekly Quota**: Limits clients to 3 active reservations per week
3. **Soft Delete**: Reservations can be cancelled (status change) or hard deleted

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest + Supertest
- **IoT Protocol**: MQTT
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # HTTP request handlers
│   ├── middlewares/       # Express middlewares
│   ├── repositories/      # Data access layer
│   ├── routes/            # API route definitions
│   │   └── validators/    # Request validation schemas
│   ├── services/          # Business logic layer
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── __tests__/         # Test files
│   ├── app.ts             # Express app configuration
│   └── index.ts           # Application entry point
├── docker-compose.yml     # Docker services configuration
├── Dockerfile             # Application container
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your settings
# Required variables:
# - DATABASE_URL: PostgreSQL connection string
# - API_KEY: Your API key for authentication
```

### 3. Start Database (Docker)

```bash
# Start PostgreSQL and MQTT broker
docker-compose up -d postgres mqtt
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Development

```bash
# Start only database services
docker-compose up -d postgres mqtt

# Run app locally
npm run dev
```

### Production

```bash
# Build and start all services
docker-compose --profile production up -d
```

## 📡 API Endpoints

All API endpoints require the `x-api-key` header.

### Health Check

```
GET /health          # Public health check
GET /                # API information
```

### Places

```
GET    /api/places          # List all places
GET    /api/places/:id      # Get place by ID
POST   /api/places          # Create new place
PUT    /api/places/:id      # Update place
DELETE /api/places/:id      # Delete place
```

### Spaces

```
GET    /api/spaces          # List spaces (paginated, filterable)
GET    /api/spaces/:id      # Get space by ID
POST   /api/spaces          # Create new space
PUT    /api/spaces/:id      # Update space
DELETE /api/spaces/:id      # Delete space
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)
- `placeId`: Filter by place
- `isActive`: Filter by active status

### Reservations

```
GET    /api/reservations           # List reservations (paginated, filterable)
GET    /api/reservations/:id       # Get reservation by ID
POST   /api/reservations           # Create new reservation
PUT    /api/reservations/:id       # Update reservation
PATCH  /api/reservations/:id/cancel # Cancel reservation (soft delete)
DELETE /api/reservations/:id       # Delete reservation (hard delete)
```

**Query Parameters:**
- `page`, `pageSize`: Pagination
- `spaceId`, `placeId`: Filter by location
- `clientEmail`: Filter by client
- `status`: Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `dateFrom`, `dateTo`: Filter by date range

## 📝 API Examples

### Create a Place

```bash
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "name": "Tech Hub Downtown",
    "location": "123 Main Street, City, 12345"
  }'
```

### Create a Space

```bash
curl -X POST http://localhost:3000/api/spaces \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "placeId": "place-uuid-here",
    "name": "Conference Room A",
    "capacity": 10,
    "reference": "Floor 2, Room 201",
    "description": "Large conference room with projector"
  }'
```

### Create a Reservation

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "spaceId": "space-uuid-here",
    "clientEmail": "john.doe@example.com",
    "date": "2026-02-01",
    "startTime": "09:00",
    "endTime": "11:00",
    "notes": "Team meeting"
  }'
```

### List Reservations with Pagination

```bash
curl "http://localhost:3000/api/reservations?page=1&pageSize=10&status=CONFIRMED" \
  -H "x-api-key: your-api-key"
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Integration Tests

```bash
# Make sure test database is running
npm run test:integration
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## 📡 IoT Integration (MQTT)

The API subscribes to MQTT topics for receiving telemetry data from IoT sensors.

### Topic Structure

```
coworking/{site}/{office}/telemetry
```

- `site`: Maps to Place name or ID
- `office`: Maps to Space name or ID

### Message Payload

```json
{
  "peopleCount": 5,
  "temperature": 22.5,
  "humidity": 45.0,
  "co2": 450,
  "battery": 85.0,
  "timestamp": "2026-01-19T10:30:00Z"
}
```

### Testing MQTT Locally

```bash
# Publish test message using mosquitto_pub
mosquitto_pub -h localhost -t "coworking/Tech Hub/Room A/telemetry" \
  -m '{"temperature": 22.5, "humidity": 45, "co2": 450, "peopleCount": 3}'
```

## 🔒 Security

- **API Key Authentication**: All `/api/*` routes require valid `x-api-key` header
- **Helmet.js**: Security headers middleware
- **CORS**: Configurable origin restrictions
- **Input Validation**: Express-validator for request sanitization
- **Error Handling**: No stack traces exposed in production

## 📊 Database Schema

### Place (Lugar)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Building name |
| location | String | Address or coordinates |

### Space (Espacio)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| placeId | UUID | FK to Place |
| name | String | Space name |
| reference | String? | Internal reference |
| capacity | Int | Max occupancy |
| description | String? | Description |
| isActive | Boolean | Active status |

### Reservation (Reserva)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| spaceId | UUID | FK to Space |
| placeId | UUID | FK to Place (denormalized*) |
| clientEmail | String | Client identifier |
| date | Date | Reservation date |
| startTime | DateTime | Start time |
| endTime | DateTime | End time |
| status | Enum | PENDING/CONFIRMED/CANCELLED/COMPLETED |
| notes | String? | Optional notes |

*Note: `placeId` is denormalized to avoid JOINs on common queries. Trade-off: slight redundancy vs. query performance.

### Telemetry
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| placeId | UUID | FK to Place |
| spaceId | UUID | FK to Space |
| peopleCount | Int? | Occupancy count |
| temperature | Float? | Temperature (°C) |
| humidity | Float? | Humidity (%) |
| co2 | Float? | CO2 level (ppm) |
| battery | Float? | Sensor battery (%) |
| timestamp | DateTime | Reading time |

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm test` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Run tests with coverage |

## 📄 License

MIT
