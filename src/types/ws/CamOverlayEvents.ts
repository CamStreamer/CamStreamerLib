import { z } from 'zod';

const coEventsDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('authorization'), state: z.string() }),
    z.object({
        type: z.literal('ServiceStart'),
        serviceId: z.number(),
    }),
    z.object({
        type: z.literal('ServiceStop'),
        serviceId: z.number(),
    }),
]);

export const coEventsSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('init'), data: coEventsDataSchema }),
    ...coEventsDataSchema.options,
]);

export type TCamOverlayEvent = z.infer<typeof coEventsSchema>;
export type TCamOverlayEventType = TCamOverlayEvent['type'];
export type TCamOverlayEventOfType<T extends TCamOverlayEventType> = Extract<TCamOverlayEvent, { type: T }>;
