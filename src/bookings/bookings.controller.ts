import type { Request, Response, NextFunction } from "express";
import { createBooking, getBooking, deleteBooking } from "./bookings.service.ts";
import { HttpError } from "../errors/http-error.ts";
import type { CreateBookingInput } from "./bookings.schema.ts";

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { eventId } = req.body as CreateBookingInput;
        const currentUserId = "temp-user-id"; // Hard-coded current user as per spec
        
        const booking = await createBooking(eventId, currentUserId);
        res.status(201).json(booking);
    } catch (e) {
        next(e);
    }
}

export async function getBookingHandler(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const booking = await getBooking(req.params.id);

        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }

        res.status(200).json(booking);
    } catch (e) {
        next(e);
    }
}

export async function deleteBookingHandler(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const booking = await deleteBooking(req.params.id);

        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }

        res.status(200).json(booking);
    } catch (e) {
        next(e);
    }
}
