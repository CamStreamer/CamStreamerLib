import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const mpegDvbSchema = streamCommonSchema.extend({
    type: z.literal('mpeg_dvb'),
    ipAddress: z.string(),
    port: z.number(),
    standard: z.enum(['DVB', 'ATSC']),
    nullPacketsPaddingEnabled: z.boolean(),
    nullPacketsPaddingKbps: z.number(),
    videoPid: z.number(),
    audioPid: z.number(),
    mpegtsStreamId: z.number(),
    pmtPid: z.number(),
    pcrPid: z.number(),
    pcrPeriodMs: z.number(),
    providerName: z.string(),
    serviceName: z.string(),
    triggerType: z.enum(['manual', 'onetime', 'recurrent', 'io', 'nonstop']),
    statusCameraLed: z.boolean(),
    statusCameraOutput: z.number(),
    saveToSdCard: z.boolean(),
});
