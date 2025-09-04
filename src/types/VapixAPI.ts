import { HttpOptions } from '../internal/types';
import { z } from 'zod';
import { toCamelCaseDeep } from '../internal/transformers';

export type CameraVapixOptions = HttpOptions;

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
export type TApplication = z.infer<typeof applicationSchema> & {
    appId: null | TApplicationId;
};

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
export type TSDCardInfo = {
    status: (typeof sdCardWatchedStatuses)[number];
    totalSize: number;
    freeSize: number;
};

export const PtzOverviewSchema = z.record(z.number(), z.array(z.object({ id: z.number(), name: z.string() })));
export type TPtzOverview = z.infer<typeof PtzOverviewSchema>;

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
        timeZone: z.string(),
    }),
});

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
