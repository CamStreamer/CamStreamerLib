import { HttpOptions } from '../internal/common';
import { z } from 'zod';

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
export type TApplication = z.infer<typeof applicationSchema>;

export const applicationListSchema = z.object({
    reply: z.object({
        $: z.object({ result: z.string() }),
        application: z.array(
            z.object({
                $: applicationSchema,
            })
        ),
    }),
});
export type TApplicationList = z.infer<typeof applicationListSchema>;

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

export const audioSampleRatesSchema = z.object({
    sampleRate: z.number(),
    bitRates: z.array(z.number()),
});
export type TAudioSampleRates = z.infer<typeof audioSampleRatesSchema>;

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
    powerType: z.string(),
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

export const audioDeviceFromRequestSchema = z.object({
    id: z.string(),
    name: z.string(),
    inputs: z.array(audioDeviceInputOutputSchema).optional(),
    outputs: z.array(audioDeviceInputOutputSchema).optional(),
});
export type TAudioDeviceFromRequest = z.infer<typeof audioDeviceFromRequestSchema>;
