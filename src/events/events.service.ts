import type { CreateEventInput, UpdateEventInput, EventQuery } from "./events.schema.ts";
import { eventsRepository } from "./events.repository.ts";

export async function createEvent(input: CreateEventInput) {
    return await eventsRepository.create(input);
}

export async function listEvents(query: EventQuery = {}) {
    return await eventsRepository.list(query);
}

export async function getEvent(id: string) {
    return await eventsRepository.findById(id);
}

export async function updateEvent(
    id: string,
    input: UpdateEventInput,
) {
    return await eventsRepository.update(id, input);
}

export async function deleteEvent(id: string) {
    return await eventsRepository.delete(id);
}