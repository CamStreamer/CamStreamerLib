import { HttpOptions } from '../internal/types';
import { z } from 'zod';

export type CamStreamerAPIOptions = HttpOptions;

export const streamAttributesSchema = z.object({
    enabled: z.string(),
    active: z.string(),
    audioSource: z.string(),
    avSyncMsec: z.string(),
    internalVapixParameters: z.string(),
    userVapixParameters: z.string(),
    outputParameters: z.string(),
    outputType: z.string(),
    mediaServerUrl: z.string(),
    inputType: z.string(),
    inputUrl: z.string(),
    forceStereo: z.string(),
    streamDelay: z.string(),
    statusLed: z.string(),
    statusPort: z.string(),
    callApi: z.string(),
    trigger: z.string(),
    schedule: z.string(),
    prepareAhead: z.string(),
    startTime: z.string(),
    stopTime: z.string(),
});
export type TStreamAttributes = z.infer<typeof streamAttributesSchema>;
export const streamListSchema = z.record(z.string(), streamAttributesSchema);
export type TStreamList = z.infer<typeof streamListSchema>;
