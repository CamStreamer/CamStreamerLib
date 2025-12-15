import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const commonRtmpSchema = streamCommonSchema.extend({
    outputUrl: z.string(),
    streamKey: z.string(),
    streamIdentifier: z.string().optional(),

    saveToSdCard: z.boolean(),
    statusCameraLed: z.boolean(),
    statusCameraOutput: z.string(),
});

export const rtmpSchema = commonRtmpSchema.extend({
    type: z.literal('rtmp'),
});
