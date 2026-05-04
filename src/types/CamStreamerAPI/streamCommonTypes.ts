import { z } from 'zod';
import { booleanSchema } from '../common';

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

export const internalVapixParametersSchema = z.object({
    camera: z.string(),
    resolution: z.string().optional(),
    compression: z.number().optional(),
    fps: z.number().int().optional(),
    videobitrate: z.number().int().optional(),
    videomaxbitrate: z.number().int().optional(),
    audio: booleanSchema.optional(),
});
export type TInternalVapixParameters = z.infer<typeof internalVapixParametersSchema>;

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

export const streamCommonSchema = z.object({
    id: z.number(),
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),
    trigger: streamTriggerSchema,
    inputType: streamInputTypeSchema,
    internalVapixParameters: internalVapixParametersSchema,
    audio: streamAudioSchema,
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;
