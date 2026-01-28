import { boolean, z } from 'zod';

import { facebookSchema } from './facebookSchema';
import { windySchema } from './windySchema';
import { youtubeSchema } from './youtubeSchema';
import {
    daCastSchema,
    dailymotionSchema,
    facebookRtmpSchema,
    gameChangerSchema,
    hlsPullSchema,
    hlsPushSchema,
    ibmSchema,
    microsoftAzureSchema,
    microsoftStreamSchema,
    mpegDvbSchema,
    rtmpSchema,
    sdCardSchema,
    srtSchema,
    streamPlatforms,
    twitchSchema,
    vimeoSchema,
    wowzaSchema,
    youtubeRtmpSchema,
} from './streamsSchema';

import { FileLike, fileSchema } from '../common';

//   ----------------------------------------
//                    Streams
//   ----------------------------------------

export const streamSchema = z.discriminatedUnion('platform', [
    facebookSchema,
    facebookRtmpSchema,
    mpegDvbSchema,
    rtmpSchema,
    sdCardSchema,
    windySchema,
    youtubeSchema,
    vimeoSchema,
    twitchSchema,
    srtSchema,
    daCastSchema,
    hlsPullSchema,
    hlsPushSchema,
    wowzaSchema,
    dailymotionSchema,
    ibmSchema,
    microsoftAzureSchema,
    microsoftStreamSchema,
    gameChangerSchema,
    youtubeRtmpSchema,
]);
export type TStream = z.infer<typeof streamSchema>;
export type TPlatform = (typeof streamPlatforms)[keyof typeof streamPlatforms];

export const streamListSchema = z.object({ streamList: z.array(streamSchema) });
export type TStreamList = z.infer<typeof streamListSchema>;

export type TFacebookStream = z.infer<typeof facebookSchema>;
export const isFacebookStream = (stream: TStream): stream is TFacebookStream => {
    return stream.platform === streamPlatforms.facebook;
};

export type TFacebookRtmpStream = z.infer<typeof facebookRtmpSchema>;
export const isFacebookRtmpStream = (stream: TStream): stream is TFacebookRtmpStream => {
    return stream.platform === streamPlatforms.facebook_rtmp;
};

export type TMpegDvbStream = z.infer<typeof mpegDvbSchema>;
export const isMpegDvbStream = (stream: TStream): stream is TMpegDvbStream => {
    return stream.platform === streamPlatforms.mpeg_dvb;
};

export type TRtmpStream = z.infer<typeof rtmpSchema>;
export const isRtmpStream = (stream: TStream): stream is TRtmpStream => {
    return stream.platform === streamPlatforms.rtmp;
};

export type TSdCardStream = z.infer<typeof sdCardSchema>;
export const isSdCardStream = (stream: TStream): stream is TSdCardStream => {
    return stream.platform === streamPlatforms.sd_card;
};

export type TWindyStream = z.infer<typeof windySchema>;
export const isWindyStream = (stream: TStream): stream is TWindyStream => {
    return stream.platform === streamPlatforms.windy;
};

export type TYouTubeStream = z.infer<typeof youtubeSchema>;
export const isYouTubeStream = (stream: TStream): stream is TYouTubeStream => {
    return stream.platform === streamPlatforms.youtube;
};

export type TVimeoStream = z.infer<typeof vimeoSchema>;
export const isVimeoStream = (stream: TStream): stream is TVimeoStream => {
    return stream.platform === streamPlatforms.vimeo;
};

export type TTwitchStream = z.infer<typeof twitchSchema>;
export const isTwitchStream = (stream: TStream): stream is TTwitchStream => {
    return stream.platform === streamPlatforms.twitch;
};

export type TSrtStream = z.infer<typeof srtSchema>;
export const isSrtStream = (stream: TStream): stream is TSrtStream => {
    return stream.platform === streamPlatforms.srt;
};

export type TDaCastStream = z.infer<typeof daCastSchema>;
export const isDaCastStream = (stream: TStream): stream is TDaCastStream => {
    return stream.platform === streamPlatforms.da_cast;
};

export type THlsPullStream = z.infer<typeof hlsPullSchema>;
export const isHlsPullStream = (stream: TStream): stream is THlsPullStream => {
    return stream.platform === streamPlatforms.hls_pull;
};

export type THlsPushStream = z.infer<typeof hlsPushSchema>;
export const isHlsPushStream = (stream: TStream): stream is THlsPushStream => {
    return stream.platform === streamPlatforms.hls_push;
};

export type TWowzaStream = z.infer<typeof wowzaSchema>;
export const isWowzaStream = (stream: TStream): stream is TWowzaStream => {
    return stream.platform === streamPlatforms.wowza;
};

export type TDailymotionStream = z.infer<typeof dailymotionSchema>;
export const isDailymotionStream = (stream: TStream): stream is TDailymotionStream => {
    return stream.platform === streamPlatforms.dailymotion;
};

export type TIbmStream = z.infer<typeof ibmSchema>;
export const isIbmStream = (stream: TStream): stream is TIbmStream => {
    return stream.platform === streamPlatforms.ibm;
};

export type TMicrosoftAzureStream = z.infer<typeof microsoftAzureSchema>;
export const isMicrosoftAzureStream = (stream: TStream): stream is TMicrosoftAzureStream => {
    return stream.platform === streamPlatforms.microsoft_azure;
};

export type TMicrosoftStream = z.infer<typeof microsoftStreamSchema>;
export const isMicrosoftStream = (stream: TStream): stream is TMicrosoftStream => {
    return stream.platform === streamPlatforms.microsoft_stream;
};

export type TGameChangerStream = z.infer<typeof gameChangerSchema>;
export const isGameChangerStream = (stream: TStream): stream is TGameChangerStream => {
    return stream.platform === streamPlatforms.game_changer;
};

export type TYoutubeRtmpStream = z.infer<typeof youtubeRtmpSchema>;
export const isYoutubeRtmpStream = (stream: TStream): stream is TYoutubeRtmpStream => {
    return stream.platform === streamPlatforms.youtube_rtmp;
};

//   ----------------------------------------
//               Storage & Files
//   ----------------------------------------

export enum AudioType {
    MP3,
    AAC,
}

export const audioFileStorageTypeSchema = z.union([z.literal('flash'), z.literal('SD0'), z.literal('url')]);
export type TAudioFileStorageType = z.infer<typeof audioFileStorageTypeSchema>;
export type TSourceType = 'local' | 'url';

export const storageListSchema = z.array(
    z.discriminatedUnion('type', [
        z.object({
            type: z.literal('flash'),
            flash: z.string(),
        }),
        z.object({
            type: z.literal('SD0'),
            SD0: z.string(),
        }),
    ])
);
export type TStorageList = z.infer<typeof storageListSchema>;

export const audioFileSchema = z.object({
    name: z.string(),
    path: z.string(),
    storage: audioFileStorageTypeSchema,
});
export type TAudioFile = z.infer<typeof audioFileSchema>;

export const audioFileListSchema = z.array(audioFileSchema);
export type TAudioFileList = z.infer<typeof audioFileListSchema>;

export type TFileToUpload = {
    storage: TAudioFileStorageType;
    name: string;
    file: FileLike | string | null;
};

export const audioUrlSchema = z.object({
    fileUrl: z.string(),
    name: z.string(),
    storage: z.literal('url'),
});
export type TAudioUrlType = z.infer<typeof audioUrlSchema>;

export const audioLocalSchema = z.object({
    file: fileSchema,
    name: z.string(),
    storage: z.enum(['flash', 'SD0']),
});
export type TAudioLocalType = z.infer<typeof audioLocalSchema>;

//   ----------------------------------------
//                Statistics
//   ----------------------------------------

export const streamStatsSchema = z.object({
    net_stats: z.string(),
    stream_bytes_time_ms: z.number().nonnegative(),
    stream_bytes: z.number().nonnegative(),
    start_count: z.number().nonnegative(),
    is_streaming: z.literal(0).or(z.literal(1)),
});
export type TStreamStats = z.infer<typeof streamStatsSchema>;

export const srtStreamStatisticsSchema = z.object({
    msTimeStamp: z.number().nonnegative(),
    pktSentTotal: z.number().nonnegative(),
    byteSentTotal: z.number().nonnegative(),
    pktRetransTotal: z.number().nonnegative(),
    byteRetransTotal: z.number().nonnegative(),
    pktSndDropTotal: z.number().nonnegative(),
    byteSndDropTotal: z.number().nonnegative(),
    mbpsSendRate: z.number().nonnegative(),
    mbpsBandwidth: z.number().nonnegative(),
    mbpsMaxBW: z.number().nonnegative(),
    msRTT: z.number().nonnegative(),
    msSndBuf: z.number().nonnegative(),
});
export type TSrtStreamStatistics = z.infer<typeof srtStreamStatisticsSchema>;

export const diagnosticsParamsSchema = z.object({
    camerainfo: boolean().optional(),
    checkserver: boolean().optional(),
    checkservertime: boolean().optional(),
    speedtest: boolean().optional(),
    pingtest: boolean().optional(),
    videoHostPort: z.string().optional(),
    audioHostPort: z.string().optional(),
});
export type TDiagnosticsParams = z.infer<typeof diagnosticsParamsSchema>;
export const diagnosticsSchema = z.object({
    status: z.number(),
    message: z.string(),
    data: z.object({
        audioHostPort: z
            .object({
                code: z.number(),
                message: z.string(),
            })
            .optional(),
        cameraInfo: z
            .object({
                uptime: z.string(),
                availableRAM: z.number(),
                availableInternal: z.number(),
            })
            .optional(),
        checkServer: z
            .object({
                state: z.string(),
                message: z.string(),
            })
            .optional(),
        checkServerTime: z
            .object({
                code: z.number(),
                message: z.string(),
            })
            .optional(),
        videoHostPort: z
            .object({
                code: z.number(),
                message: z.string(),
            })
            .optional(),
        speedTest: z
            .object({
                code: z.string(),
                data: z.array(z.object({ timestamp: z.number(), speed: z.number() })),
            })
            .optional(),
        pingTest: z
            .object({
                output: z.string(),
            })
            .optional(),
    }),
});
export type TDiagnostics = z.infer<typeof diagnosticsSchema>;
