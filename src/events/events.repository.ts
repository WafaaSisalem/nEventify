import { prisma } from "../infra/db.ts";
import type { EventQuery, CreateEventInput, UpdateEventInput } from "./events.schema.ts";

export const eventsRepository = {
    async list(query: EventQuery = {}) {
        const { page = 1, limit = 20, venue, from, to } = query;
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (venue) where.venue = venue;
        if (from) where.startsAt = { gte: from };
        if (to) {
            where.startsAt = where.startsAt || {};
            where.startsAt.lte = to;
        }

        const [data, total] = await Promise.all([
            prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startsAt: "asc" }
            }),
            prisma.event.count({ where })
        ]);

        return {
            data,
            page,
            limit,
            total,
        };
    },

    async findById(id: string) {
        return await prisma.event.findUnique({
            where: { id }
        });
    },

    async create(input: CreateEventInput) {
        // Find a valid organizer to satisfy the foreign key constraint until Auth is implemented
        const user = await prisma.user.findFirst({ where: { role: "ORGANIZER" } });
        const organizerId = user?.id ?? "00000000-0000-0000-0000-000000000000";

        return await prisma.event.create({
            data: {
                organizerId,
                ...input
            }
        });
    },

    async update(id: string, input: UpdateEventInput) {
        try {
            return await prisma.event.update({
                where: { id },
                data: input
            });
        } catch (e: unknown) {
            // Prisma throws P2025 if record to update not found
            const err = e as { code?: string };
            if (err.code === 'P2025') return null;
            throw e;
        }
    },

    async delete(id: string) {
        try {
            await prisma.event.delete({
                where: { id }
            });
            return true;
        } catch (e) {
            const err = e as { code?: string };
            if (err.code === 'P2025') return false;
            throw e;
        }
    }
};
