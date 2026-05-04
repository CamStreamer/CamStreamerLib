import { z } from 'zod';
import { bitrateVapixParamsSchema, booleanSchema, h264ProfileSchema } from '../common';

export const streamTypeSchema = z.union([
    z.literal('youtube'),
    z.literal('facebook'),
    z.literal('sd_card'),
    z.literal('windy'),
    z.literal('mpeg_dvb'),
    z.literal('rtmp'),
    z.literal('dailymotion'),
    z.literal('ibm'),
    z.literal('hls_pull'),
    z.literal('hls_push'),
    z.literal('wowza'),
    z.literal('microsoft_stream'),
    z.literal('microsoft_azure'),
    z.literal('vimeo'),
    z.literal('twitch'),
    z.literal('church'),
    z.literal('srt'),
    z.literal('da_cast'),
    z.literal('game_changer'),
]);
export type TStreamType = z.infer<typeof streamTypeSchema>;

const scheduleSchema = z.object({
    start: z.object({
        day: z.number().int().min(0).max(6),
        timeS: z.number().int().min(0).max(86400),
    }),
    stop: z.object({
        day: z.number().int().min(0).max(6),
        timeS: z.number().int().min(0).max(86400),
    }),
    isActive: z.boolean(),
});
export const streamTriggerSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('manual'),
        ioPort: z.string().nullable(),
    }),
    z.object({ type: z.literal('onetime'), startTime: z.number(), stopTime: z.number() }),
    z.object({
        type: z.literal('recurrent'),
        schedule: z.array(scheduleSchema),
    }),
]);
export type TStreamTrigger = z.infer<typeof streamTriggerSchema>;
export type TStreamTriggerType = TStreamTrigger['type'];
export type TTriggerSchedule = z.infer<typeof scheduleSchema>;

export const streamInputTypeSchema = z.union([z.literal('CSw'), z.literal('CRS'), z.literal('RTSP_URL')]);
export type TStreamInputType = z.infer<typeof streamInputTypeSchema>;

export const streamingProtocolTypeSchema = z.union([
    z.literal('RTSP'),
    z.literal('RTMP'),
    z.literal('RTMPS'),
    z.literal('HLS'),
]);
export type TStreamingProtocolType = z.infer<typeof streamingProtocolTypeSchema>;

export const videoCodecSchema = z.union([z.literal('h264'), z.literal('h265'), z.literal('av1')]);
export type TVideoCodec = z.infer<typeof videoCodecSchema>;

export const overlaysSchema = z.union([
    z.literal('all'),
    z.literal('text'),
    z.literal('image'),
    z.literal('application'),
    z.literal(''), // = camera settings
    z.literal('off'),
]);
export type TOverlays = z.infer<typeof overlaysSchema>;

export const streamDelaySchema = z.object({
    enabled: z.boolean(),
    timeS: z.number().int(),
    unit: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
});
export type TStreamDelay = z.infer<typeof streamDelaySchema>;
export type TStreamDelayUnit = TStreamDelay['unit'];

export const streamVideoSchema = bitrateVapixParamsSchema.extend({
    camera: z.string(),
    resolution: z.string(),
    fps: z.number().int(),
    compression: z.number().int(),
    govLength: z.number().int(), // =  videokeyframeinterval
    videoCodec: videoCodecSchema,
    h264Profile: h264ProfileSchema.optional(),

    audio: booleanSchema,
    nbrOfChannels: z.union([z.literal(1), z.literal(2)]).optional(), // 1 = mono, 2 = stereo
    overlays: z
        .union([
            z.literal('all'),
            z.literal('text'),
            z.literal('image'),
            z.literal('application'),
            z.literal(''), // = camera settings
            z.literal('off'),
        ])
        .optional(), // IMPORTANT - used only for FW > 10.6
});
export type TStreamVideo = z.infer<typeof streamVideoSchema>;

export const streamAudioSchema = z.discriminatedUnion('source', [
    z.object({
        source: z.literal('none'),
    }),
    z.object({ source: z.literal('microphone'), audioChannelNbr: z.union([z.literal(1), z.literal(2)]) }),
    z.object({
        source: z.literal('file'),
        fileName: z.string(),
        filePath: z.string(),
    }),
    z.object({
        source: z.literal('url'),
        fileName: z.string(),
        fileUrl: z.string(),
        avSyncMsec: z.number().int().nonnegative(),
    }),
]);
export type TStreamAudioSchema = z.infer<typeof streamAudioSchema>;
export type TStreamAudioSource = TStreamAudioSchema['source'];
export type TAudioOfSource<T extends TStreamAudioSource> = {
    audio: Extract<TStreamAudioSchema, { source: T }>;
};

// this will be saved to camera
export const streamCommonSchema = z.object({
    id: z.number(),
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
    trigger: streamTriggerSchema,
    inputType: streamInputTypeSchema,
    internalVapixParameters: z.union([z.string(), streamVideoSchema]),
    userVapixParameters: z.string(),
    streamingProtocol: streamingProtocolTypeSchema,
    streamDelay: streamDelaySchema,
    audio: streamAudioSchema,
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
