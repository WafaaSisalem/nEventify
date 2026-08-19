import { prisma } from "../infra/db.ts";
import { HttpError } from "../errors/http-error.ts";
import { Prisma } from "../generated/prisma/client.ts";

export async function createBooking(eventId: string, userId: string) {
    try {
        return await prisma.$transaction(
            async (tx) => {
                // capacity check counting CONFIRMED only
                const event = await tx.event.findUnique({
                    where: { id: eventId },
                });

                if (!event) {
                    throw new HttpError(404, "Event not found");
                }

                const confirmedCount = await tx.booking.count({
                    where: {
                        eventId,
                        status: "CONFIRMED"
                    }
                });

                if (confirmedCount >= event.capacity) {
                    throw new HttpError(409, "Event is at full capacity");
                }

                // Check for existing booking to handle rebooking semantics
                const existingBooking = await tx.booking.findFirst({
                    where: {
                        userId,
                        eventId
                    }
                });

                if (existingBooking) {
                    if (existingBooking.status === "CANCELLED") {
                        // CANCELLED -> CONFIRMED rebooking
                        return await tx.booking.update({
                            where: { id: existingBooking.id },
                            data: { status: "CONFIRMED" }
                        });
                    } else if (existingBooking.status === "WAITLISTED") {
                        // WAITLISTED -> leave unchanged
                        return existingBooking;
                    }
                    
                    // If CONFIRMED, let's trigger a Prisma P2002 intentionally by creating a duplicate
                    // (Or we can just throw a 409 directly, but the spec says map P2002 -> 409).
                    // We'll proceed to try creating so P2002 is naturally triggered, 
                    // or just throw here since we already loaded it.
                    // Wait, if it's already CONFIRMED, the easiest way to satisfy "P2002 -> 409" is
                    // to just attempt the insert and catch P2002 outside. So we fall through.
                }

                // create booking (when no existing row, or to intentionally hit P2002 if CONFIRMED exists)
                return await tx.booking.create({
                    data: {
                        userId,
                        eventId,
                        status: "CONFIRMED"
                    }
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            }
        );
    } catch (e) {
        const err = e as { code?: string };
        if (err.code === 'P2002') {
            throw new HttpError(409, "User already has a booking for this event");
        }
        throw e;
    }
}

export async function getBooking(id: string) {
    return await prisma.booking.findUnique({
        where: { id }
    });
}

export async function deleteBooking(id: string) {
    try {
        return await prisma.booking.update({
            where: { id },
            data: { status: "CANCELLED" }
        });
    } catch (e) {
        const err = e as { code?: string };
        if (err.code === 'P2025') return undefined;
        throw e;
    }
}
