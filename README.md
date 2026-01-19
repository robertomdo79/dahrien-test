# SGRET - Smart Workspace Reservation System

A full-stack application for managing co-working space reservations with IoT integration for real-time environmental monitoring.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [IoT Integration](#iot-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Overview

SGRET is a modern workspace reservation platform designed for co-working spaces. It enables users to browse available spaces, make reservations, and monitor real-time environmental conditions through IoT sensors.

## ✨ Features

### Core Features
- **Places Management**: Manage buildings and locations
- **Spaces Management**: Create and manage rentable units (offices, meeting rooms, desks)
- **Reservations System**: Full booking system with conflict detection
- **Real-time Dashboard**: View and manage all resources

### Business Rules
- **Conflict Detection**: Prevents double-booking for overlapping time slots
- **Weekly Quota**: Limits clients to 3 active reservations per week
- **Soft Delete**: Reservations can be cancelled (status change) or permanently deleted

### IoT Integration
- **Environmental Monitoring**: Temperature, humidity, and CO2 levels
- **Occupancy Tracking**: Real-time people count per space
- **MQTT Protocol**: Standard IoT communication protocol

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| Zustand | State Management |
| React Router 7 | Routing |
| Axios | HTTP Client |
| date-fns | Date Utilities |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express.js | Web Framework |
| TypeScript | Type Safety |
| Prisma | ORM |
| PostgreSQL | Database |
| Jest | Testing |
| MQTT | IoT Protocol |
| Docker | Containerization |

## 📁 Project Structure

```
sgret/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── context/            # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layouts
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── backend/                # Backend API
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── __tests__/      # Test files
│   ├── docker-compose.yml  # Docker services
│   └── Dockerfile          # API container
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker & Docker Compose (for database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sgret.git
   cd sgret
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Frontend (from root directory)
   cp .env.example .env

   # Backend
   cd backend
   cp .env.example .env
   ```

5. **Start the database**
   ```bash
   cd backend
   docker-compose up -d postgres mqtt
   ```

6. **Run database migrations**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Optional: seed sample data
   ```

7. **Start the development servers**

   Backend (from `/backend` directory):
   ```bash
   npm run dev
   ```

   Frontend (from root directory):
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `npm run db:studio` (from backend)

## 🔐 Environment Variables

### Frontend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_API_KEY` | API Key for authentication | - |

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API server port | `3000` |
| `API_KEY` | API Key for authentication | - |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `MQTT_BROKER_URL` | MQTT broker URL | `mqtt://localhost:1883` |
| `MQTT_CLIENT_ID` | MQTT client identifier | `workspace-reservation-api` |
| `MQTT_TELEMETRY_TOPIC` | MQTT topic pattern | `coworking/+/+/telemetry` |
| `LOG_LEVEL` | Logging level | `debug` |

## 📡 API Documentation

All API endpoints require the `x-api-key` header for authentication.

### Base URL
```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (no auth) |
| GET | `/places` | List all places |
| POST | `/places` | Create a place |
| GET | `/places/:id` | Get place by ID |
| PUT | `/places/:id` | Update place |
| DELETE | `/places/:id` | Delete place |
| GET | `/spaces` | List spaces (paginated) |
| POST | `/spaces` | Create a space |
| GET | `/spaces/:id` | Get space by ID |
| PUT | `/spaces/:id` | Update space |
| DELETE | `/spaces/:id` | Delete space |
| GET | `/reservations` | List reservations (paginated) |
| POST | `/reservations` | Create reservation |
| GET | `/reservations/:id` | Get reservation by ID |
| PUT | `/reservations/:id` | Update reservation |
| PATCH | `/reservations/:id/cancel` | Cancel reservation |
| DELETE | `/reservations/:id` | Delete reservation |

For detailed API documentation, see [Backend README](./backend/README.md).

## 📡 IoT Integration

The system integrates with IoT sensors via MQTT for real-time environmental monitoring.

### MQTT Topic Structure
```
coworking/{site}/{office}/telemetry
```

### Telemetry Payload
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
mosquitto_pub -h localhost -t "coworking/TechHub/RoomA/telemetry" \
  -m '{"temperature": 22.5, "humidity": 45, "co2": 450, "peopleCount": 3}'
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

### Frontend Type Check
```bash
# From root directory
npm run type-check
```

### Linting
```bash
# Frontend
npm run lint

# Backend
cd backend
npm run lint
```

## 🐳 Deployment

### Docker Deployment

```bash
cd backend

# Development (database only)
docker-compose up -d postgres mqtt

# Production (all services)
docker-compose --profile production up -d
```

### Production Build

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM.

### Models
- **Place**: Buildings/locations
- **Space**: Rentable units within places
- **Reservation**: Bookings for spaces
- **Telemetry**: IoT sensor readings

For detailed schema, see [Prisma Schema](./backend/prisma/schema.prisma).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for modern co-working spaces
