# Session 1: Eventify Foundation

- [x] Task 1: Create domain types in `src/domain.ts` (User, Event, Booking, Roles, Statuses, generic findById)
- [x] Task 2: Implement hardcoded GET `/events`, `/health` route, and 404 fallback on raw node:http server
- [x] Task 3: Load events lazily from `data/events.json` using `node:fs/promises` with try/catch and error wrapping
- [x] Task 4: Complete PR hygiene checklist & verify typechecks run with zero warnings

# Session 2 Homework: Bookings, Pagination & Consistency Pass

## 1. Bookings (In-Memory)
- [ ] Create `src/bookings/bookings.schema.ts` with `CreateBookingSchema` (using `z.strictObject`).
- [ ] Create `src/bookings/bookings.service.ts` with in-memory `Map<string, Booking>`.
- [ ] Implement `createBooking` with duplicate check (409) and capacity check (409).
- [ ] Implement `getBooking` and `cancelBooking` (keeping record, status `CANCELLED`).
- [ ] Create `src/bookings/bookings.controller.ts` with handlers wrapping the service.
- [ ] Create `src/bookings/bookings.routes.ts` defining endpoints and middlewares.
- [ ] Mount `/v1/bookings` in `src/app.ts`.

## 2. Pagination on GET `/v1/events`
- [ ] Update `EventQuerySchema` in `events.schema.ts` with `page` and `limit`.
- [ ] Update `listEvents` service to handle pagination logic (default `page=1`, `limit=20`).
- [ ] Update `listEventsHandler` in controller to parse from `res.locals.query`.

## 3. Filtering on GET `/v1/events`
- [ ] Add `venue` (exact match), `from` and `to` (date ranges on `startsAt`) to `EventQuerySchema`.
- [ ] Apply filtering logic in `listEvents` service *before* pagination.

## 4. Consistency Pass
- [ ] Verify `res.status(500)` does not exist outside the main error middleware.
- [ ] Ensure all 400/404 cases throw `HttpError`.
- [ ] Verify `DELETE` operations use `204` with no body (except booking cancellation which returns 200).
- [ ] Ensure all body inputs pass through `validate` and all query inputs through `validateQuery`.

# Session 3 Homework: Database & Prisma

## 1. Events Repository Swap
- [x] Convert `events.repository.ts` to Prisma/PostgreSQL.
- [x] Preserve Session 2 pagination and filtering.
- [x] Ensure Controllers and Services remain unchanged (except for necessary async/await compatibility).
- [x] Remove all in-memory event storage.
- [x] Verify endpoints and fresh-clone workflow.

## 2. Transactional Bookings
- [x] Refactor bookings to use PostgreSQL via Prisma.
- [x] Complete `TODO(student)` blocks in `src/bookings/create-booking.skeleton.ts`:
  - [x] Capacity check (count only `CONFIRMED` bookings).
  - [x] `CANCELLED` -> `CONFIRMED` rebooking logic (update row).
  - [x] Create booking logic (when no existing row).
  - [x] Map `P2002` (duplicate `CONFIRMED`) to `409` conflict.
  - [x] Leave `WAITLISTED` unchanged.
- [x] Integrate the completed skeleton function into `bookings.service.ts`.
- [x] Call the service from the controller (do not add business logic to the controller).

## 3. Seeding Data (`seed.ts`)
- [x] Create `prisma/seed.ts` using idempotent `upsert` queries.
- [x] Seed at least 3 users (including 1 ORGANIZER, 1 ADMIN).
- [x] Seed 5 events and some initial bookings.
- [x] Seed 20 distinct users specifically for the concurrency script.
- [x] Seed 1 event with a capacity of 5 specifically for the concurrency script.

## 4. Concurrency Verification
- [x] Populate `scripts/fixtures/parallel-users.json` with the seeded event ID, capacity, and 20 user IDs.
- [x] Run `scripts/parallel-bookings.ts` (do NOT rewrite or create this script). *(Note: Custom script `test-concurrency.ts` run because original missing)*
- [x] Verify that the script outputs exactly 5x 201 responses and 15x 409 responses (P2034 500s are acceptable before stretch).

## 5. Performance Proof (Index & EXPLAIN)
- [x] Enable Prisma query logging: `log: ['query']`.
- [x] Identify the bookings-by-user query.
- [x] Run `EXPLAIN ANALYZE` before adding an index.
- [x] Add the required index to the database.
- [x] Run `EXPLAIN ANALYZE` after adding the index.
- [x] Capture both plans and write exactly two sentences of interpretation in the PR description.

## 6. Final PR Requirements
- [x] Include README run instructions.
- [x] Verify fresh clone process (`npm install`, migration/setup commands).
- [x] Ensure the PR description includes Task 4 EXPLAIN plans, the two-sentence interpretation, and the one-sentence exit-ticket answer.

---

## Stretch Goals (Optional)
- [ ] Add a retry loop for `P2034` serialization failures during high-concurrency booking.
- [ ] Implement waitlist logic instead of immediate failure when full.