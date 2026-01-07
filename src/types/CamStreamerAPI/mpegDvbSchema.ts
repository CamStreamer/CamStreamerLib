import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const mpegDvbSchema = streamCommonSchema.extend({
    type: z.literal('mpeg_dvb'),
    ipAddress: z.string(),
    port: z.number(),
    outputUrl: z.string(),
    outputParameters: z.string(),
    statusCameraLed: z.boolean(),
    statusCameraOutput: z.string().nullable(),
    saveToSdCard: z.boolean(),
});
