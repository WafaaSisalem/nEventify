import type { Request, Response, NextFunction } from "express";
import {
    createEvent,
    listEvents,
    getEvent,
    updateEvent,
    deleteEvent,
} from "./events.service.ts";
import { HttpError } from "../errors/http-error.ts";
import type { EventQuery } from "./events.schema.ts";

export async function createEventHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const event = await createEvent(req.body);
        res.status(201).json(event);
    } catch (e) {
        next(e);
    }
}

export async function listEventsHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const events = await listEvents(res.locals.query as EventQuery);
        res.status(200).json(events);
    } catch (e) {
        next(e);
    }
}

export async function getEventHandler(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const event = await getEvent(req.params.id);

        if (!event) {
            throw new HttpError(404, "Event not found");
        }

        res.status(200).json(event);
    } catch (e) {
        next(e);
    }
}

export async function updateEventHandler(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const event = await updateEvent(req.params.id, req.body);

        if (!event) {
            throw new HttpError(404, "Event not found");
        }

        res.status(200).json(event);
    } catch (e) {
        next(e);
    }
}

export async function deleteEventHandler(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
        const deleted = await deleteEvent(req.params.id);

        if (!deleted) {
            throw new HttpError(404, "Event not found");
        }

        res.status(204).end();
    } catch (e) {
        next(e);
    }
}