import { z } from 'zod';

export const streamTypeSchema = z.union([
    z.literal('youtube'),
    z.literal('facebook'),
    z.literal('sd_card'),
    z.literal('windy'),
    z.literal('mpeg_dvb'),
    z.literal('hls'),
    z.literal('rtmp'),
]);
export type TStreamType = z.infer<typeof streamTypeSchema>;

export const streamTriggerSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('manual'),
        ioPort: z.string().nullable(),
    }),
    z.object({ type: z.literal('onetime'), startTime: z.number(), stopTime: z.number() }),
    z.object({
        type: z.literal('recurrent'),
        schedule: z.array(
            z.object({
                day: z.number().int().min(0).max(6),
                startTimeS: z.number().int().min(0).max(86400),
                stopTimeS: z.number().int().min(0).max(86400),
                isActive: z.boolean(),
            })
        ),
    }),
]);
export type TStreamTrigger = z.infer<typeof streamTriggerSchema>;
export type TStreamTriggerType = TStreamTrigger['type'];

export const streamCommonSchema = z.object({
    id: z.number(),
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
    trigger: streamTriggerSchema,
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
