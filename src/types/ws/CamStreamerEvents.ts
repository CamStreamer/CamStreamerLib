import { z } from 'zod';

const csEventsDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('authorization'), state: z.string() }),
    z.object({
        type: z.literal('StreamState'),
        streamId: z.string(),
        isStreaming: z.boolean(),
        active: z.boolean(),
        enabled: z.boolean(),
    }),
    z.object({
        type: z.literal('CS_API_SUCCESS'),
        apiCall: z.string(),
        message: z.string(),
        streamId: z.string(),
    }),
    z.object({
        type: z.literal('CS_API_ERROR'),
        apiCall: z.string(),
        message: z.string(),
        streamId: z.string(),
        code: z.string(),
    }),
    z.object({
        type: z.literal('PortChanged'),
        port: z.number(),
        value: z.boolean(),
    }),
]);

export const csEventsSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('init'), data: csEventsDataSchema }),
    ...csEventsDataSchema.options,
]);

export type TCamStreamerEvent = z.infer<typeof csEventsDataSchema>;
export type TCamStreamerEventType = TCamStreamerEvent['type'];
export type TCamStreamerEventOfType<T extends TCamStreamerEventType> = Extract<TCamStreamerEvent, { type: T }>;
