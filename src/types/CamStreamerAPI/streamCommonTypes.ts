import { z } from 'zod';
import { bitrateVapixParamsSchema, booleanSchema, h264ProfileSchema } from '../common';

//   ----------------------------------------
//                Common schema
//   ----------------------------------------

export const streamCommonSchema = z.object({
    streamId: z.string(),
    enabled: z.boolean(),
    active: z.boolean(),
    title: z.string(),

    trigger: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('manual'),
            ioPort: z.number().nullable(),
        }),
        z.object({
            type: z.literal('onetime'),
            startTime: z.number(),
            stopTime: z.number(),
            // ioPort: z.string().nullable(),
        }),
        z.object({
            type: z.literal('recurrent'),
            schedule: z.array(
                z.object({
                    start: z.object({
                        day: z.number().int().min(0).max(6),
                        timeS: z.number().int().min(0).max(86400),
                    }),
                    stop: z.object({
                        day: z.number().int().min(0).max(6),
                        timeS: z.number().int().min(0).max(86400),
                    }),
                    isActive: z.boolean(),
                })
            ),
        }),
    ]),

    video: z.object({
        output: z.discriminatedUnion('callApi', [
            z.object({
                type: z.union([z.literal('video'), z.literal('images')]),
                callApi: z.literal(false),
                url: z.string(),
            }),
            z.object({
                type: z.literal('video'),
                callApi: z.literal(true),
                prepareAheadS: z.number(),
            }),
        ]),
        outputParameters: z.string(),
        input: z.discriminatedUnion('type', [
            z.object({
                type: z.literal('RTSP_URL'),
                url: z.string(),
            }),
            z.object({
                type: z.union([z.literal('CSw'), z.literal('CRS')]),
            }),
        ]),
        streamingProtocol: z.union([z.literal('RTMP'), z.literal('RTMPS'), z.literal('HLS_PUSH')]),
        internalVapixParameters: z.string(),
        userVapixParameters: z.string(),
        streamDelay: z
            .object({
                value: z.number().int(),
                unit: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
            })
            .optional(),
    }),

    audio: z
        .discriminatedUnion('source', [
            z.object({
                source: z.literal('microphone'),
                audioChannelNbr: z.union([z.literal(1), z.literal(2)]),
                forceStereo: booleanSchema,
            }),
            z.object({
                source: z.literal('file'),
                fileName: z.string(),
                filePath: z.string(),
                forceStereo: booleanSchema,
            }),
            z.object({
                source: z.literal('url'),
                fileName: z.string(),
                fileUrl: z.string(),
                avSyncMsec: z.number().int().nonnegative(),
                forceStereo: booleanSchema,
            }),
        ])
        .nullable(),

    status: z.object({
        led: z.string(),
        port: z.string(),
    }),
});
export type TCommonStream = z.infer<typeof streamCommonSchema>;

//   ----------------------------------------
//                Audio Settings
//   ----------------------------------------

export type TStreamAudio = TCommonStream['audio'];
export type TStreamAudioSource = NonNullable<TStreamAudio>['source'];
export type TAudioOfSource<T extends TStreamAudioSource> = {
    audio: Extract<TStreamAudio, { source: T }>;
};

//   ----------------------------------------
//                  Triggering
//   ----------------------------------------

export type TStreamTrigger = TCommonStream['trigger'];
export type TStreamTriggerType = TStreamTrigger['type'];
export type TTriggerSchedule = Extract<TStreamTrigger, { type: 'recurrent' }>['schedule'];

//   ----------------------------------------
//          Stream and Video Settings
//   ----------------------------------------

export type TStreamVideo = TCommonStream['video'];

export type TStreamInputType = TStreamVideo['input']['type'];
export type TStreamOutputType = TStreamVideo['output']['type'];
export type TStreamingProtocolType = TStreamVideo['streamingProtocol'];

export type TStreamDelay = TStreamVideo['streamDelay'];
export type TStreamDelayUnit = NonNullable<TStreamDelay>['unit'];

export const internalVapixParametersSchema = bitrateVapixParamsSchema.extend({
    camera: z.string(),
    resolution: z.string(),
    fps: z.number().int(),
    compression: z.number().int(),
    govLength: z.number().int(), // =  videokeyframeinterval
    videoCodec: z.union([z.literal('h264'), z.literal('h265'), z.literal('av1')]),
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
export type TVideoCodec = TInternalVapixParameters['videoCodec'];
export type TOverlays = TInternalVapixParameters['overlays'];
