import { HttpOptions } from '../internal/common';

export type CameraVapixOptions = HttpOptions;

export type TApplicationList = {
    reply: {
        $: { result: string };
        application: {
            $: TApplication;
        }[];
    };
};

export type TApplication = {
    Name: string;
    NiceName: string;
    Vendor: string;
    Version: string;
    ApplicationID?: string;
    License: string;
    Status: string;
    ConfigurationPage?: string;
    VendorHomePage?: string;
    LicenseName?: string;
};

export type TGuardTour = {
    id: string;
    camNbr: unknown;
    name: string;
    randomEnabled: unknown;
    running: string;
    timeBetweenSequences: unknown;
    tour: {
        moveSpeed: unknown;
        position: unknown;
        presetNbr: unknown;
        waitTime: unknown;
        waitTimeViewType: unknown;
    }[];
};

export type TAudioSampleRates = {
    sampleRate: number;
    bitRates: number[];
};

export type TSDCardInfo = {
    available: boolean;
    totalSize: number;
    freeSize: number;
};

export type TPtzOverview = Record<number, { id: number; name: string }[]>;

export type TCameraPTZItem = {
    name: string;
    id: number;
    data: TCameraPTZItemData;
};

export type TCameraPTZItemData = {
    pan?: number;
    tilt?: number;
    zoom?: number;
};

export type TAudioDeviceSignalingChannelType = {
    id: string;
    gain: number;
    mute: boolean;
};

export type TAudioDeviceSignalingType = {
    id: string;
    powerType: string;
    channels: TAudioDeviceSignalingChannelType[];
};

export type TAudioDeviceConnectionType = {
    id: string;
    signalingTypeSelected: string;
    signalingTypes: TAudioDeviceSignalingType[];
};

export type TAudioDeviceInputOutput = {
    id: string;
    name: string;
    enabled: boolean;
    connectionTypes: TAudioDeviceConnectionType[];
    connectionTypeSelected: string;
};

export type TAudioDevice = {
    id: string;
    name: string;
    inputs: TAudioDeviceInputOutput[];
    outputs: TAudioDeviceInputOutput[];
};

export type TAudioDeviceFromRequest = {
    id: string;
    name: string;
    inputs?: TAudioDeviceInputOutput[];
    outputs?: TAudioDeviceInputOutput[];
};
