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
    callApi: z.boolean(),

    trigger: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('manual'),
            port: z.number().optional(),
        }),
        z.object({
            type: z.literal('onetime'),
            startTime: z.number(),
            stopTime: z.number(),
            everActivated: z.boolean(),
            prepareAheadS: z.number().int().optional(),
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
            prepareAheadS: z.number().int().optional(),
        }),
    ]),

    video: z.object({
        output: z.discriminatedUnion('type', [
            z.object({
                type: z.literal('video'),
                url: z.string().nullable(),
                parameters: z.string(),
                saveToSdCard: z
                    .object({
                        ruleId: z.string(),
                        configurationId: z.string(),
                    })
                    .optional(),
            }),
            z.object({
                type: z.literal('images'),
                url: z.string().nullable(),
                imageIntervalS: z.number(),
            }),
            z.object({
                type: z.literal('none'),
                saveToSdCard: z.object({
                    ruleId: z.string(),
                    configurationId: z.string(),
                }),
            }),
        ]),
        input: z.discriminatedUnion('type', [
            z.object({
                type: z.literal('RTSP_URL'),
                url: z.string(),
                internalVapixParameters: z.string(),
            }),
            z.object({
                type: z.literal('CSw'),
                internalVapixParameters: z.string(),
            }),
            z.object({
                type: z.literal('CRS'),
                internalVapixParameters: z.string(),
                userVapixParameters: z.string(),
            }),
        ]),
        delayS: z.number().int().nonnegative().optional(),
    }),

    audio: z.discriminatedUnion('source', [
        z.object({
            source: z.literal('none'),
        }),
        z.object({
            source: z.literal('microphone'),
            audioChannelNbr: z.number().int(),
            forceStereo: z.boolean(),
        }),
        z.object({
            source: z.literal('file'),
            name: z.string(),
            path: z.string(),
            forceStereo: z.boolean(),
        }),
        z.object({
            source: z.literal('url'),
            name: z.string(),
            url: z.string(),
            avSyncMsec: z.number().int().nonnegative(),
            forceStereo: z.boolean(),
        }),
    ]),

    status: z.object({
        led: z.boolean(),
        port: z.number().optional(),
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
        .union([z.literal('all'), z.literal('text'), z.literal('image'), z.literal('application'), z.literal('off')])
        .optional(), // IMPORTANT - used only for FW > 10.6 --- OR camera settings selected -> should not be added to vapix params
});
export type TInternalVapixParameters = z.infer<typeof internalVapixParametersSchema>;
export type TVideoCodec = TInternalVapixParameters['videoCodec'];
export type TOverlays = TInternalVapixParameters['overlays'];
