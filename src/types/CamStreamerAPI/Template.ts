import { z } from 'zod';

/* This file is just as example for editing real schemas - so you can just copy and modify most of the props necessary */

z.discriminatedUnion('type', [
    z.object({
        type: z.literal('youtube'),
        account: z
            .object({
                userName: z.string(),
                avatarImagePath: z.string(),
            })
            .nullable(),
        description: z.string().optional(),
        enableManualControls: z.union([z.literal(0), z.literal(1)]),
        playlist: z.string(),
        tags: z.array(z.string()),
        email: z.string().optional(),
        privacy: z.union([z.literal('public'), z.literal('unlisted'), z.literal('private')]),
        mediaServerUrl: z.string().optional(),
        streamKey: z.string().optional(),

        // Advanced settings
        latency: z.union([z.literal('normal'), z.literal('low'), z.literal('ultraLow')]),
        dvr: z.union([z.literal(0), z.literal(1)]),
        thumbnail: z.string().nullable(),
        statusAfterEnd: z.union([
            z.literal('withoutChange'),
            z.literal('public'),
            z.literal('unlisted'),
            z.literal('private'),
        ]),
        offlinePicture: z.string().nullable(),
        cameraLed: z.union([z.literal(0), z.literal(1)]),
        cameraOutput: z.union([z.literal('none'), z.literal('port1'), z.literal('port2')]),
        saveToSDCard: z.union([z.literal(0), z.literal(1)]),

        // Video settings
        videoSource: z.string(),
        quality: z.string(),
        resolution: z.string(),
        frameRate: z.number().int(),
        compression: z.number().int(),
        keyFrameInterval: z.number().int(),
        streamingProtocol: z.union([z.literal('rtmp'), z.literal('rtmps'), z.literal('hls')]),
        codec: z.union([z.literal('h264'), z.literal('h265'), z.literal('av1')]),
        videoProfile: z.union([z.literal('baseline'), z.literal('main'), z.literal('high')]),
        bitrateControl: z.union([z.literal('variable'), z.literal('maximum'), z.literal('average')]),
        overlayGraphics: z.string(),
        targetBitrate: z.number().int(),
        retentionTime: z.number().int(),
        bitrateLimit: z.number().int(),
        vapixRtsp: z.string().nullable(),
        additionalVideoDelay: z.number().int().nullable(),
        additionalVideoDelayTime: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
    }),
    z.object({
        type: z.literal('facebook'),
        account: z
            .object({
                userName: z.string(),
                avatarImagePath: z.string(),
            })
            .nullable(),
        description: z.string(),
        whereToPost: z.union([z.literal('timeline'), z.literal('page')]),
        privacy: z.union([z.literal('public'), z.literal('friends'), z.literal('onlyMe')]).nullable(),
        page: z.string().nullable(),

        // Advanced settings
        deleteAfterEnd: z.union([z.literal(0), z.literal(1)]),
        offlinePicture: z.string().nullable(),
        cameraLed: z.union([z.literal(0), z.literal(1)]),
        cameraOutput: z.union([z.literal('none'), z.literal('port1'), z.literal('port2')]),
        saveToSDCard: z.union([z.literal(0), z.literal(1)]),

        // Video settings
        videoSource: z.string(),
        quality: z.string(),
        resolution: z.string(),
        frameRate: z.number().int(),
        compression: z.number().int(),
        keyFrameInterval: z.number().int(),
        streamingProtocol: z.union([z.literal('rtmp'), z.literal('rtmps'), z.literal('hls')]),
        codec: z.union([z.literal('h264'), z.literal('h265'), z.literal('av1')]),
        videoProfile: z.union([z.literal('baseline'), z.literal('main'), z.literal('high')]),
        bitrateControl: z.union([z.literal('variable'), z.literal('maximum'), z.literal('average')]),
        overlayGraphics: z.string(),
        targetBitrate: z.number().int(),
        retentionTime: z.number().int(),
        bitrateLimit: z.number().int(),
        vapixRtsp: z.string().nullable(),
        additionalVideoDelay: z.number().int().nullable(),
        additionalVideoDelayTime: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
    }),
    z.object({ type: z.literal('sd_card') }),
    z.object({
        type: z.literal('windy'),
        address: z.string(),
        position: z.union([z.literal('public'), z.literal('unlisted'), z.literal('private')]),
        locationName: z.string(),
        direction: z.string(),
        webPage: z.string(),
    }),
    z.object({
        type: z.literal('mpeg_dvb'),
        hostname: z.string(),
        port: z.string(),
        standard: z.union([z.literal('dvb'), z.literal('atsc')]),
        nullPacketsPadding: z.union([z.literal(0), z.literal(1)]),
        videoPid: z.string(),
        audioPid: z.string(),
        streamId: z.string(),
        pmtPid: z.string(),
        pcrPid: z.string(),
        pcrPeriod: z.number().int(),
        providerName: z.string(),
        serviceName: z.string(),

        // Advanced settings
        cameraLed: z.union([z.literal(0), z.literal(1)]),
        cameraOutput: z.union([z.literal('none'), z.literal('port1'), z.literal('port2')]),
        saveToSDCard: z.union([z.literal(0), z.literal(1)]),

        // Video settings
        videoSource: z.string(),
        quality: z.string(),
        resolution: z.string(),
        frameRate: z.number().int(),
        compression: z.number().int(),
        keyFrameInterval: z.number().int(),
        codec: z.union([z.literal('h264'), z.literal('h265')]),
        videoProfile: z.union([z.literal('baseline'), z.literal('main'), z.literal('high')]),
        bitrateControl: z.union([z.literal('variable'), z.literal('maximum'), z.literal('average')]),
        overlayGraphics: z.string(),
        targetBitrate: z.number().int(),
        retentionTime: z.number().int(),
        bitrateLimit: z.number().int(),
        vapixRtsp: z.string().nullable(),
        additionalVideoDelay: z.number().int().nullable(),
        additionalVideoDelayTime: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
    }),
    z.object({
        type: z.literal('hls'),
        segmentTime: z.number().int(),
        maxSegments: z.number().int(),
        hostname: z.string().optional(),
        filename: z.string().optional(),

        // Advanced settings
        cameraLed: z.union([z.literal(0), z.literal(1)]),
        cameraOutput: z.union([z.literal('none'), z.literal('port1'), z.literal('port2')]),
        saveToSDCard: z.union([z.literal(0), z.literal(1)]),

        // Video settings
        videoSource: z.string(),
        quality: z.string(),
        resolution: z.string(),
        frameRate: z.number().int(),
        compression: z.number().int(),
        keyFrameInterval: z.number().int(),
        codec: z.union([z.literal('h264'), z.literal('h265')]),
        videoProfile: z.union([z.literal('baseline'), z.literal('main'), z.literal('high')]),
        bitrateControl: z.union([z.literal('variable'), z.literal('maximum'), z.literal('average')]),
        overlayGraphics: z.string(),
        targetBitrate: z.number().int(),
        retentionTime: z.number().int(),
        bitrateLimit: z.number().int(),
        vapixRtsp: z.string().nullable(),
        additionalVideoDelay: z.number().int().nullable(),
        additionalVideoDelayTime: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
    }),
    z.object({
        type: z.literal('rtmp'),
        serverUrl: z.string(),
        streamKey: z.string(),
        streamIdentifierRequired: z.union([z.literal(0), z.literal(1)]),
        streamIdentifier: z.string().optional(),

        // Advanced settings
        cameraLed: z.union([z.literal(0), z.literal(1)]),
        cameraOutput: z.union([z.literal('none'), z.literal('port1'), z.literal('port2')]),
        saveToSDCard: z.union([z.literal(0), z.literal(1)]),

        // Video settings
        videoSource: z.string(),
        quality: z.string(),
        resolution: z.string(),
        frameRate: z.number().int(),
        compression: z.number().int(),
        keyFrameInterval: z.number().int(),
        streamingProtocol: z.union([z.literal('rtmp'), z.literal('rtmps')]),
        codec: z.union([z.literal('h264'), z.literal('h265'), z.literal('av1')]),
        videoProfile: z.union([z.literal('baseline'), z.literal('main'), z.literal('high')]),
        bitrateControl: z.union([z.literal('variable'), z.literal('maximum'), z.literal('average')]),
        overlayGraphics: z.string(),
        targetBitrate: z.number().int(),
        retentionTime: z.number().int(),
        bitrateLimit: z.number().int(),
        vapixRtsp: z.string().nullable(),
        additionalVideoDelay: z.number().int().nullable(),
        additionalVideoDelayTime: z.union([z.literal('seconds'), z.literal('minutes'), z.literal('hours')]),
    }),
]);

z.discriminatedUnion('triggering', [
    z.object({ triggering: z.literal('nonstop') }),
    z.object({ triggering: z.literal('manual') }),
    z.object({
        triggering: z.literal('onetime'),
        startDateTime: z.string(),
        stopDateTime: z.string(),
    }),
    z.object({
        triggering: z.literal('recurrent'),
        schedule: z.array(
            z.object({
                startDay: z.string(), // Maybe specify as enum?
                startTime: z.string(),
                stopDay: z.string(),
                stopTime: z.string(),
                isActive: z.union([z.literal(0), z.literal(1)]),
            })
        ),
    }),
    z.object({
        triggering: z.literal('io'),
        selectedIO: z.string(),
        triggersOnOpened: z.union([z.literal(0), z.literal(1)]),
    }),
]);

z.discriminatedUnion('audio', [
    z.object({ audio: z.literal('none') }),
    z.object({ audio: z.literal('microphone'), channel: z.string() }),
    z.object({ audio: z.literal('file'), file: z.string().nullable() }),
    z.object({ audio: z.literal('external'), file: z.string().nullable(), avOffset: z.number().int() }),
]);
