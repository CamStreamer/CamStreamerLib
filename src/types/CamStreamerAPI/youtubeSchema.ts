import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const youtubeSchema = streamCommonSchema.extend({
    type: z.literal('youtube'),
    description: z.string().optional(),
    playlist: z.string().optional(),
    tags: z.array(z.string()),
    notificationEmail: z.array(z.string().email()).optional(),
    streamPrivacy: z.union([z.literal('public'), z.literal('unlisted'), z.literal('private')]),
    latency: z.union([z.literal('normal'), z.literal('low'), z.literal('ultra_low')]),
    afterEndStatus: z.union([z.literal('no_change'), z.literal('public'), z.literal('unlisted'), z.literal('private')]),
    dvr: z.boolean(),
    saveToSdCard: z.boolean(),
    statusCameraLed: z.boolean(),
    statusCameraOutput: z.string().nullable(),
    hasWatchdogs: z.boolean(),
    countdown: z.boolean(),
    enableManualControl: z.boolean(),
});
