import { z } from 'zod';

const csEventsDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('authorization'), state: z.string() }),
    z.object({
        type: z.literal('StreamState'),
        streamID: z.number(),
        enabled: z.union([z.literal(0), z.literal(1)]),
        active: z.union([z.literal(0), z.literal(1)]),
        automationState: z.union([z.literal(0), z.literal(1)]),
        isStreaming: z.union([z.literal(0), z.literal(1)]),
    }),
    z.object({
        type: z.literal('CS_API_SUCCESS'),
        apiCall: z.string(),
        message: z.string(),
        streamID: z.string(),
    }),
    z.object({
        type: z.literal('CS_API_ERROR'),
        apiCall: z.string(),
        message: z.string(),
        streamID: z.string(),
        code: z.string(),
    }),
]);

export const csEventsSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('init'), data: csEventsDataSchema }),
    ...csEventsDataSchema.options,
]);

export type TCamStreamerEvent = z.infer<typeof csEventsDataSchema>;
export type TCamStreamerEventType = TCamStreamerEvent['type'];
export type TCamStreamerEventOfType<T extends TCamStreamerEventType> = Extract<TCamStreamerEvent, { type: T }>;
