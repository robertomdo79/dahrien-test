import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.telemetry.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.space.deleteMany();
  await prisma.place.deleteMany();

  // Create Places
  const place1 = await prisma.place.create({
    data: {
      name: 'Downtown Tech Hub',
      location: '123 Main Street, Tech City, TC 12345',
    },
  });

  const place2 = await prisma.place.create({
    data: {
      name: 'Creative Campus',
      location: '456 Innovation Ave, Design District, DD 67890',
    },
  });

  console.log(`✅ Created ${2} places`);

  // Create Spaces for Place 1
  const spaces1 = await Promise.all([
    prisma.space.create({
      data: {
        placeId: place1.id,
        name: 'Meeting Room Alpha',
        reference: 'Floor 1, Room 101',
        capacity: 10,
        description: 'Large conference room with projector and whiteboard',
        image: '/assets/alpha.png',
      },
    }),
    prisma.space.create({
      data: {
        placeId: place1.id,
        name: 'Focus Pod A',
        reference: 'Floor 2, Pod A',
        capacity: 1,
        description: 'Individual focus pod for deep work',
        image: '/assets/pod.png',
      },
    }),
    prisma.space.create({
      data: {
        placeId: place1.id,
        name: 'Open Workspace',
        reference: 'Floor 1, Main Area',
        capacity: 20,
        description: 'Open workspace with hot desks',
        image: '/assets/workspace.png',
      },
    }),
    prisma.space.create({
      data: {
        placeId: place1.id,
        name: 'Meeting Room Beta',
        reference: 'Floor 2, Room 201',
        capacity: 6,
        description: 'Medium conference room with video conferencing',
        image: '/assets/beta.png',
      },
    }),
  ]);

  // Create Spaces for Place 2
  const spaces2 = await Promise.all([
    prisma.space.create({
      data: {
        placeId: place2.id,
        name: 'Design Studio',
        reference: 'Building B, Studio 1',
        capacity: 8,
        description: 'Creative space with design tools and large monitors',
        image: '/assets/design.png',
      },
    }),
    prisma.space.create({
      data: {
        placeId: place2.id,
        name: 'Workshop Room',
        reference: 'Building A, Ground Floor',
        capacity: 25,
        description: 'Large workshop space for events and training',
        image: '/assets/workshop.png',
      },
    }),
    prisma.space.create({
      data: {
        placeId: place2.id,
        name: 'Quiet Zone',
        reference: 'Building B, Floor 2',
        capacity: 5,
        description: 'Silent workspace for focused work',
        image: '/assets/quiet.jpg',
      },
    }),
  ]);

  console.log(`✅ Created ${spaces1.length + spaces2.length} spaces`);

  // Create some sample reservations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const reservations = await Promise.all([
    prisma.reservation.create({
      data: {
        spaceId: spaces1[0].id,
        placeId: place1.id,
        clientEmail: 'john.doe@example.com',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(9, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(11, 0, 0, 0)),
        status: 'CONFIRMED',
        notes: 'Team standup meeting',
      },
    }),
    prisma.reservation.create({
      data: {
        spaceId: spaces1[1].id,
        placeId: place1.id,
        clientEmail: 'jane.smith@example.com',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(17, 0, 0, 0)),
        status: 'CONFIRMED',
        notes: 'Deep work session',
      },
    }),
    prisma.reservation.create({
      data: {
        spaceId: spaces2[0].id,
        placeId: place2.id,
        clientEmail: 'robbiemdo79@gmail.com',
        date: nextWeek,
        startTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        status: 'PENDING',
        notes: 'Design review',
      },
    }),
    prisma.reservation.create({
      data: {
        spaceId: spaces1[2].id,
        placeId: place1.id,
        clientEmail: 'robbiemdo79@gmail.com',
        date: tomorrow,
        startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        status: 'CONFIRMED',
        notes: 'Coworking session',
      },
    }),
  ]);

  console.log(`✅ Created ${reservations.length} reservations`);

  // Create sample telemetry data
  const telemetryData = await Promise.all([
    prisma.telemetry.create({
      data: {
        placeId: place1.id,
        spaceId: spaces1[0].id,
        peopleCount: 5,
        temperature: 22.5,
        humidity: 45.0,
        co2: 450,
        battery: 85.0,
        rawData: { sensor: 'sensor-001' },
      },
    }),
    prisma.telemetry.create({
      data: {
        placeId: place1.id,
        spaceId: spaces1[2].id,
        peopleCount: 12,
        temperature: 23.1,
        humidity: 48.0,
        co2: 520,
        battery: 72.0,
        rawData: { sensor: 'sensor-002' },
      },
    }),
    prisma.telemetry.create({
      data: {
        placeId: place2.id,
        spaceId: spaces2[0].id,
        peopleCount: 3,
        temperature: 21.8,
        humidity: 42.0,
        co2: 410,
        battery: 95.0,
        rawData: { sensor: 'sensor-003' },
      },
    }),
  ]);

  console.log(`✅ Created ${telemetryData.length} telemetry records`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Places: 2`);
  console.log(`   - Spaces: ${spaces1.length + spaces2.length}`);
  console.log(`   - Reservations: ${reservations.length}`);
  console.log(`   - Telemetry records: ${telemetryData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
