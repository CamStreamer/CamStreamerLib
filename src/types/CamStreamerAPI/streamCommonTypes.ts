import { z } from 'zod';

export const STREAM_TYPES = {
    youtube: 'youtube',
    facebook: 'facebook',
    sdCard: 'sd_card',
    windy: 'windy',
    mpegDvb: 'mpeg_dvb',
    hls: 'hls',
    rtmp: 'rtmp',
} as const;

export const streamTypeSchema = z.union([
    z.literal(STREAM_TYPES.youtube),
    z.literal(STREAM_TYPES.facebook),
    z.literal(STREAM_TYPES.sdCard),
    z.literal(STREAM_TYPES.windy),
    z.literal(STREAM_TYPES.mpegDvb),
    z.literal(STREAM_TYPES.hls),
    z.literal(STREAM_TYPES.rtmp),
]);
export type TStreamType = z.infer<typeof streamTypeSchema>;

export const TRIGGER_TYPES = {
    nonstop: 'nonstop',
    manual: 'manual',
    onetime: 'onetime',
    recurrent: 'recurrent',
    io: 'io',
} as const;
export type TTriggerType = (typeof TRIGGER_TYPES)[keyof typeof TRIGGER_TYPES];

export const AUDIO_TYPES = {
    none: 'none',
    microphone: 'microphone',
    file: 'file',
    external: 'external',
} as const;
export type TAudioType = (typeof AUDIO_TYPES)[keyof typeof AUDIO_TYPES];

export const streamCommonSchema = z.object({
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
