import { z } from 'zod';

const csEventsDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('authorization'), state: z.string() }),
    z.object({
        type: z.literal('StreamState'),
        streamID: z.number(),
        isStreaming: z.boolean(),
        active: z.boolean(),
        enabled: z.boolean(),
    }),
    z.object({
        type: z.literal('CS_API_SUCCESS'),
        apiCall: z.string(),
        message: z.string(),
        streamID: z.number(),
    }),
    z.object({
        type: z.literal('CS_API_ERROR'),
        apiCall: z.string(),
        message: z.string(),
        streamID: z.number(),
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
