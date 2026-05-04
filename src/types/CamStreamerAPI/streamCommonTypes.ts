import { z } from 'zod';
import { bitrateVapixParamsSchema, booleanSchema, h264ProfileSchema } from '../common';

//   ----------------------------------------
//                  Triggering
//   ----------------------------------------

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
    z.object({
        type: z.literal('onetime'),
        startTime: z.number(),
        stopTime: z.number(),
        ioPort: z.string().nullable(),
    }),
    z.object({
        type: z.literal('recurrent'),
        schedule: z.array(scheduleSchema),
    }),
]);
export type TStreamTrigger = z.infer<typeof streamTriggerSchema>;
export type TStreamTriggerType = TStreamTrigger['type'];
export type TTriggerSchedule = z.infer<typeof scheduleSchema>;

//   ----------------------------------------
//                 Video Settings
//   ----------------------------------------

export const streamInputTypeSchema = z.union([z.literal('CSw'), z.literal('CRS'), z.literal('RTSP_URL')]);
export type TStreamInputType = z.infer<typeof streamInputTypeSchema>;

export const streamingProtocolTypeSchema = z.union([z.literal('RTMP'), z.literal('RTMPS'), z.literal('HLS_PUSH')]);
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
    value: z.number().int(),
    unit: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
});
export type TStreamDelay = z.infer<typeof streamDelaySchema>;
export type TStreamDelayUnit = TStreamDelay['unit'];

export const internalVapixParametersSchema = bitrateVapixParamsSchema.extend({
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
export type TInternalVapixParameters = z.infer<typeof internalVapixParametersSchema>;

export const streamVideoSchema = z.object({
    inputType: streamInputTypeSchema,
    sourceUrl: z.string().optional(),
    internalVapixParameters: z.string(),
    userVapixParameters: z.string(),
    streamingProtocol: streamingProtocolTypeSchema,
    streamDelay: streamDelaySchema.optional(),
});
export type TStreamVideo = z.infer<typeof streamVideoSchema>;

//   ----------------------------------------
//                Audio Settings
//   ----------------------------------------

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
export type TStreamAudio = z.infer<typeof streamAudioSchema>;
export type TStreamAudioSource = TStreamAudio['source'];
export type TAudioOfSource<T extends TStreamAudioSource> = {
    audio: Extract<TStreamAudio, { source: T }>;
};

//   ----------------------------------------
//                Common schema
//   ----------------------------------------

export const streamCommonSchema = z.object({
    id: z.number(),
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
    trigger: streamTriggerSchema,
    video: streamVideoSchema,
    audio: streamAudioSchema,
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
