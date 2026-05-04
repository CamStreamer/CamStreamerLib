import { z } from 'zod';

export const cameraStreamSchema = z.object({
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
export type TCameraStream = z.infer<typeof cameraStreamSchema>;

export const streamSchema = z.object({
    enabled: z.union([z.literal(0), z.literal(1)]),
    active: z.union([z.literal(0), z.literal(1)]),
    audioSource: z.string(),
    avSyncMsec: z.number().int(),
    internalVapixParameters: z.string(),
    userVapixParameters: z.string(),
    outputParameters: z.string(),
    outputType: z.union([z.literal('video'), z.literal('images'), z.literal('none')]),
    mediaServerUrl: z.string(),
    inputType: z.union([z.literal('CSw'), z.literal('CRS'), z.literal('RTSP_URL')]),
    inputUrl: z.string(),
    forceStereo: z.union([z.literal(0), z.literal(1)]),
    streamDelay: z.number().nullable(),
    statusLed: z.number(),
    statusPort: z.string(),
    callApi: z.number().int(),
    trigger: z.string(),
    schedule: z.string(),
    prepareAhead: z.number().int(),
    startTime: z.number().nullable(),
    stopTime: z.number().nullable(),
});
export type TStream = z.infer<typeof streamSchema>;

export const cameraStreamResponseSchema = z.object({
    data: cameraStreamSchema,
    code: z.number(),
    message: z.string(),
});
export type TStreamCameraDataResponse = z.infer<typeof cameraStreamResponseSchema>;

export const camstreamerServerResponseSchema = z.object({
    code: z.number(),
    message: z.string(),
});
export type TCamstreamerServerResponse = z.infer<typeof camstreamerServerResponseSchema>;
