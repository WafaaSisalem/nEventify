import { createBooking } from './src/bookings/bookings.service.ts';
import fs from 'node:fs/promises';

async function run() {
  const data = JSON.parse(await fs.readFile('./scripts/fixtures/parallel-users.json', 'utf-8'));
  const eventId = data.eventId;
  const users = data.users;

  console.log(`Starting ${users.length} parallel booking requests for event ${eventId}...`);

  const results = await Promise.allSettled(
    users.map((userId: string) => createBooking(eventId, userId))
  );

  let successCount = 0;
  let conflictCount = 0;
  let otherErrorCount = 0;

  for (const res of results) {
    if (res.status === 'fulfilled') {
      successCount++;
    } else {
      if (res.reason.statusCode === 409) {
        conflictCount++;
      } else {
        console.error(res.reason);
        otherErrorCount++;
      }
    }
  }

  console.log(`Success (201): ${successCount}`);
  console.log(`Conflict (409): ${conflictCount}`);
  console.log(`Other Errors: ${otherErrorCount}`);
}

run().catch(console.error);
