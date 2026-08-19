import { prisma } from '../src/infra/db.ts';


async function main() {
  console.log("Starting seed...");

  // 1. Seed 3 distinct users (ADMIN, ORGANIZER, ATTENDEE)
  const adminId = "00000000-0000-0000-0000-000000000001";
  await prisma.user.upsert({
    where: { email: "admin@eventify.local" },
    update: {},
    create: {
      id: adminId,
      email: "admin@eventify.local",
      name: "Admin User",
      passwordHash: "dummy-hash",
      role: "ADMIN",
    },
  });

  const organizerId = "00000000-0000-0000-0000-000000000002";
  await prisma.user.upsert({
    where: { email: "organizer@eventify.local" },
    update: {},
    create: {
      id: organizerId,
      email: "organizer@eventify.local",
      name: "Organizer User",
      passwordHash: "dummy-hash",
      role: "ORGANIZER",
    },
  });

  const attendeeId = "00000000-0000-0000-0000-000000000003";
  await prisma.user.upsert({
    where: { email: "attendee@eventify.local" },
    update: {},
    create: {
      id: attendeeId,
      email: "attendee@eventify.local",
      name: "Attendee User",
      passwordHash: "dummy-hash",
      role: "ATTENDEE",
    },
  });

  // 2. Seed 5 events
  const eventIds = [
    "00000000-0000-0000-0000-100000000001",
    "00000000-0000-0000-0000-100000000002",
    "00000000-0000-0000-0000-100000000003",
    "00000000-0000-0000-0000-100000000004",
    "00000000-0000-0000-0000-100000000005"
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.event.upsert({
      where: { id: eventIds[i] },
      update: {},
      create: {
        id: eventIds[i],
        title: `Seeded Event ${i + 1}`,
        description: `Description for event ${i + 1}`,
        venue: "Main Hall",
        startsAt: new Date(new Date().getTime() + 86400000 * (i + 1)), // Future dates
        capacity: 100,
        priceCents: 1500,
        organizerId: organizerId,
      },
    });
  }

  // 3. Seed some bookings for the first event
  await prisma.booking.upsert({
    where: {
      userId_eventId: {
        userId: attendeeId,
        eventId: eventIds[0]
      }
    },
    update: {},
    create: {
      userId: attendeeId,
      eventId: eventIds[0],
      status: "CONFIRMED",
    }
  });

  // 4. Concurrency Test Data
  // Create 20 distinct users and 1 event with capacity 5
  console.log("Seeding concurrency test data...");
  const concurrencyEventId = "ffffffff-ffff-ffff-ffff-000000000000";
  await prisma.event.upsert({
    where: { id: concurrencyEventId },
    update: {},
    create: {
      id: concurrencyEventId,
      title: "Concurrency Test Event",
      description: "An event explicitly sized at 5 for concurrency verification.",
      venue: "Stress Test Room",
      startsAt: new Date(new Date().getTime() + 86400000 * 30),
      capacity: 5,
      priceCents: 0,
      organizerId: organizerId,
    },
  });

  const parallelUserIds: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const id = `ee000000-0000-0000-0000-${i.toString().padStart(12, '0')}`;
    parallelUserIds.push(id);
    await prisma.user.upsert({
      where: { email: `parallel${i}@eventify.local` },
      update: {},
      create: {
        id,
        email: `parallel${i}@eventify.local`,
        name: `Parallel User ${i}`,
        passwordHash: "dummy-hash",
        role: "ATTENDEE",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
