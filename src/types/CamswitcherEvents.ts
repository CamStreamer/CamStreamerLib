import { z } from 'zod';

const cswEventsDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('authorization'), state: z.string() }),
    z.object({
        type: z.literal('PlaylistSwitch'),
        playlist_name: z.string(),
    }),
    z.object({
        type: z.literal('StreamAvailable'),
        stream_name: z.string(),
        state: z.boolean(),
    }),
    z.object({
        type: z.literal('StreamSwitchAudio'),
        stream_name: z.string().optional(),
        clip_name: z.string().optional(),
        master_audio: z.boolean(),
    }),
    z.object({
        type: z.literal('StreamSwitchAudioError'),
        stream_name: z.string().optional(),
        clip_name: z.string().optional(),
        master_audio: z.boolean(),
    }),
    z.object({
        type: z.literal('StreamSwitchVideo'),
        playlist_active_stream: z.number(),
        stream_name: z.string().optional(),
        playlist_name: z.string().optional(),
        clip_name: z.string().optional(),
    }),
    z.object({
        type: z.literal('PlaylistQueueChange'),
        queue: z.array(z.string()),
    }),
    z.object({
        type: z.literal('ClipUpload'),
        clip_name: z.string().optional(),
    }),
    z.object({
        type: z.literal('SwitcherStop'),
        default_playlist_id: z.string().optional(),
    }),
    z.object({
        type: z.literal('SwitcherStart'),
        default_playlist_id: z.string().optional(),
    }),
    z.object({
        type: z.literal('MediaServerStarted'),
    }),
    z.object({
        type: z.literal('ClipRemove'),
        clip_name: z.string(),
    }),
]);

export const cswEventsSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('init'), data: cswEventsDataSchema }),
    ...cswEventsDataSchema.options,
]);

export type TCamSwitcherEvent = z.infer<typeof cswEventsDataSchema>;
export type TCamSwitcherEventType = TCamSwitcherEvent['type'];
export type TCamSwitcherEventOfType<T extends TCamSwitcherEventType> = Extract<TCamSwitcherEvent, { type: T }>;
