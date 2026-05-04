import { z } from 'zod';
import { toCamelCaseDeep } from '../internal/transformers';

export const applicationSchema = z.object({
    Name: z.string(),
    NiceName: z.string(),
    Vendor: z.string(),
    Version: z.string(),
    ApplicationID: z.string().optional(),
    License: z.string(),
    Status: z.string(),
    ConfigurationPage: z.string().optional(),
    VendorHomePage: z.string().optional(),
    LicenseName: z.string().optional(),
});
export const applicationListSchema = z.array(
    applicationSchema.extend({
        appId: z
            .union([
                z.literal('CamStreamer'),
                z.literal('CamSwitcher'),
                z.literal('CamOverlay'),
                z.literal('CamScripter'),
                z.literal('PlaneTracker'),
                z.literal('Ndihxplugin'),
                z.literal('SportTracker'),
            ])
            .nullable(),
    })
);

export const APP_IDS = [
    'CamStreamer',
    'CamSwitcher',
    'CamOverlay',
    'CamScripter',
    'PlaneTracker',
    'Ndihxplugin',
    'SportTracker',
] as const;
export type TApplicationId = (typeof APP_IDS)[number];
export type TApplicationList = z.infer<typeof applicationListSchema>;
export type TApplication = z.infer<typeof applicationListSchema>[number];

export const guardTourSchema = z.object({
    id: z.string(),
    camNbr: z.unknown(),
    name: z.string(),
    randomEnabled: z.unknown(),
    running: z.string(),
    timeBetweenSequences: z.unknown(),
    tour: z.array(
        z.object({
            moveSpeed: z.unknown(),
            position: z.unknown(),
            presetNbr: z.unknown(),
            waitTime: z.unknown(),
            waitTimeViewType: z.unknown(),
        })
    ),
});
export type TGuardTour = z.infer<typeof guardTourSchema>;

const audioSampleRatesSchema = z.object({
    sample_rate: z.number(),
    bit_rates: z.array(z.number()),
});
const audioSampleRatesOutSchema = audioSampleRatesSchema.transform(toCamelCaseDeep);
export type TAudioSampleRates = z.infer<typeof audioSampleRatesOutSchema>;

export const sdCardWatchedStatuses = ['OK', 'connected', 'disconnected'] as const;
export const sdCardInfoSchema = z.object({
    status: z.enum(sdCardWatchedStatuses),
    totalSize: z.number(),
    freeSize: z.number(),
});
export type TSDCardInfo = z.infer<typeof sdCardInfoSchema>;

export const ptzOverviewSchema = z.record(z.number(), z.array(z.object({ id: z.number(), name: z.string() })));
export type TPtzOverview = z.infer<typeof ptzOverviewSchema>;

export const cameraPTZItemDataSchema = z.object({
    pan: z.number().optional(),
    tilt: z.number().optional(),
    zoom: z.number().optional(),
});
export const cameraPTZItemSchema = z.object({
    name: z.string(),
    id: z.number(),
    data: cameraPTZItemDataSchema,
});
export type TCameraPTZItem = z.infer<typeof cameraPTZItemSchema>;
export type TCameraPTZItemData = z.infer<typeof cameraPTZItemDataSchema>;

export const audioDeviceSignalingChannelTypeSchema = z.object({
    id: z.string(),
    gain: z.number(),
    mute: z.boolean(),
});
export type TAudioDeviceSignalingChannelType = z.infer<typeof audioDeviceSignalingChannelTypeSchema>;

export const audioDeviceSignalingTypeSchema = z.object({
    id: z.string(),
    powerType: z.string().optional(),
    channels: z.array(audioDeviceSignalingChannelTypeSchema),
});
export type TAudioDeviceSignalingType = z.infer<typeof audioDeviceSignalingTypeSchema>;

export const audioDeviceConnectionTypeSchema = z.object({
    id: z.string(),
    signalingTypeSelected: z.string(),
    signalingTypes: z.array(audioDeviceSignalingTypeSchema),
});
export type TAudioDeviceConnectionType = z.infer<typeof audioDeviceConnectionTypeSchema>;

export const audioDeviceInputOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    enabled: z.boolean(),
    connectionTypes: z.array(audioDeviceConnectionTypeSchema),
    connectionTypeSelected: z.string(),
});
export type TAudioDeviceInputOutput = z.infer<typeof audioDeviceInputOutputSchema>;

export const audioDeviceSchema = z.object({
    id: z.string(),
    name: z.string(),
    inputs: z.array(audioDeviceInputOutputSchema),
    outputs: z.array(audioDeviceInputOutputSchema),
});
export type TAudioDevice = z.infer<typeof audioDeviceSchema>;

const audioDeviceFromRequestSchema = z.object({
    id: z.string(),
    name: z.string(),
    inputs: z.array(audioDeviceInputOutputSchema).optional(),
    outputs: z.array(audioDeviceInputOutputSchema).optional(),
});
export const audioDeviceRequestSchema = z.object({
    data: z.object({ devices: z.array(audioDeviceFromRequestSchema) }),
});
export type TAudioDeviceFromRequest = z.infer<typeof audioDeviceFromRequestSchema>;

export const maxFpsResponseSchema = z.object({
    data: z
        .array(
            z.object({
                channel: z.number(),
                captureMode: z.array(
                    z.object({
                        enabled: z.boolean(),
                        maxFPS: z.number().optional(),
                    })
                ),
            })
        )
        .optional(),
});

export const dateTimeinfoSchema = z.object({
    data: z.object({
        dateTime: z.string(),
        dstEnabled: z.boolean(),
        localDateTime: z.string(),
        posixTimeZone: z.string(),
        timeZone: z.string().optional(), // may not be defined in some cases
    }),
});
export const timeZoneSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('success'),
        data: z.object({
            activeTimeZone: z.string(),
        }),
    }),
    z.object({
        status: z.literal('error'),
        error: z.object({
            message: z.string(),
        }),
    }),
]);

export const audioSampleRatesResponseSchema = z.object({
    data: z.object({
        encoders: z
            .object({
                aac: z.array(audioSampleRatesSchema),
                AAC: z.array(audioSampleRatesSchema),
            })
            .partial(),
    }),
});

export const portStatusSchema = z.object({
    port: z.string(),
    state: z.enum(['open', 'closed']),
    configurable: z.boolean(),
    readonly: z.boolean().optional(),
    usage: z.string(),
    direction: z.enum(['input', 'output']),
    name: z.string(),
    normalState: z.enum(['open', 'closed']),
});
export type TPortStatusSchema = z.infer<typeof portStatusSchema>;

export const getPortsResponseSchema = z.object({
    apiVersion: z.string(),
    context: z.string(),
    method: z.literal('getPorts'),
    data: z.object({
        numberOfPorts: z.number(),
        items: z.array(portStatusSchema),
    }),
});

export const portSetSchema = z.object({
    port: z.string(),
    state: z.enum(['open', 'closed']),
    usage: z.string().optional(),
    direction: z.enum(['input', 'output']).optional(),
    name: z.string().optional(),
    normalState: z.enum(['open', 'closed']).optional(),
});
export type TPortSetSchema = z.infer<typeof portSetSchema>;

export const portSequenceStateSchema = z.object({
    state: z.enum(['open', 'closed']),
    time: z.number().min(0).max(65535),
});
export type TPortSequenceStateSchema = z.infer<typeof portSequenceStateSchema>;
