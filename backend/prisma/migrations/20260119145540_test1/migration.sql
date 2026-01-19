-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "peopleCount" INTEGER,
    "co2" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "battery" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spaces_placeId_idx" ON "spaces"("placeId");

-- CreateIndex
CREATE INDEX "reservations_spaceId_idx" ON "reservations"("spaceId");

-- CreateIndex
CREATE INDEX "reservations_placeId_idx" ON "reservations"("placeId");

-- CreateIndex
CREATE INDEX "reservations_clientEmail_idx" ON "reservations"("clientEmail");

-- CreateIndex
CREATE INDEX "reservations_date_idx" ON "reservations"("date");

-- CreateIndex
CREATE INDEX "reservations_spaceId_date_idx" ON "reservations"("spaceId", "date");

-- CreateIndex
CREATE INDEX "reservations_clientEmail_date_idx" ON "reservations"("clientEmail", "date");

-- CreateIndex
CREATE INDEX "telemetry_placeId_idx" ON "telemetry"("placeId");

-- CreateIndex
CREATE INDEX "telemetry_spaceId_idx" ON "telemetry"("spaceId");

-- CreateIndex
CREATE INDEX "telemetry_timestamp_idx" ON "telemetry"("timestamp");

-- CreateIndex
CREATE INDEX "telemetry_spaceId_timestamp_idx" ON "telemetry"("spaceId", "timestamp");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
