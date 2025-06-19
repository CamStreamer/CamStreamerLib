import { HttpOptions } from '../internal/common';

export type CamStreamerAPIOptions = HttpOptions;

export type TStreamAttributes = {
    enabled: string;
    active: string;
    audioSource: string;
    avSyncMsec: string;
    internalVapixParameters: string;
    userVapixParameters: string;
    outputParameters: string;
    outputType: string;
    mediaServerUrl: string;
    inputType: string;
    inputUrl: string;
    forceStereo: string;
    streamDelay: string;
    statusLed: string;
    statusPort: string;
    callApi: string;
    trigger: string;
    schedule: string;
    prepareAhead: string;
    startTime: string;
    stopTime: string;
};
export type TStreamList = Record<string, TStreamAttributes>;
