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

export const streamCommonSchema = z.object({
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
    order: z.number(),
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
