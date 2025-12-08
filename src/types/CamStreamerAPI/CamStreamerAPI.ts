import { z } from 'zod';
import { facebookSchema } from './facebookSchema';
import { mpegDvbSchema } from './mpegDvbSchema';
import { rtmpSchema } from './rtmpSchema';
import { sdCardSchema } from './sdCardSchema';
import { windySchema } from './windySchema';
import { youtubeSchema } from './youtubeSchema';
import { vimeoSchema } from './vimeoSchema';
import { twitchSchema } from './twitchSchema';
import { churchSchema } from './churchSchema';
import { srtSchema } from './srtSchema';
import { daCastSchema } from './daCastSchema';
import { hlsPullSchema } from './hlsPullSchema';
import { hlsPushSchema } from './hlsPushSchema';
import { wowzaSchema } from './wowzaSchema';
import { dailymotionSchema } from './dailymotionSchema';
import { ibmSchema } from './ibmSchema';
import { microsoftAzureSchema } from './microsoftAzureSchema';
import { microsoftStreamSchema } from './microsoftStreamSchema';
import { gameChangerSchema } from './gameChangerSchema';

//   ----------------------------------------
//                    Streams
//   ----------------------------------------

export const streamSchema = z.discriminatedUnion('type', [
    facebookSchema,
    mpegDvbSchema,
    rtmpSchema,
    sdCardSchema,
    windySchema,
    youtubeSchema,
    vimeoSchema,
    twitchSchema,
    churchSchema,
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
]);
export type TStream = z.infer<typeof streamSchema>;

export const streamListSchema = z.object({ streamList: z.array(streamSchema) });
export type TStreamList = z.infer<typeof streamListSchema>;

export type TFacebookStream = z.infer<typeof facebookSchema>;
export const isFacebookStream = (stream: TStream): stream is TFacebookStream => {
    return stream.type === 'facebook';
};

export type TMpegDvbStream = z.infer<typeof mpegDvbSchema>;
export const isMpegDvbStream = (stream: TStream): stream is TMpegDvbStream => {
    return stream.type === 'mpeg_dvb';
};

export type TRtmpStream = z.infer<typeof rtmpSchema>;
export const isRtmpStream = (stream: TStream): stream is TRtmpStream => {
    return stream.type === 'rtmp';
};

export type TSdCardStream = z.infer<typeof sdCardSchema>;
export const isSdCardStream = (stream: TStream): stream is TSdCardStream => {
    return stream.type === 'sd_card';
};

export type TWindyStream = z.infer<typeof windySchema>;
export const isWindyStream = (stream: TStream): stream is TWindyStream => {
    return stream.type === 'windy';
};

export type TYouTubeStream = z.infer<typeof youtubeSchema>;
export const isYouTubeStream = (stream: TStream): stream is TYouTubeStream => {
    return stream.type === 'youtube';
};

export type TVimeoStream = z.infer<typeof vimeoSchema>;
export const isVimeoStream = (stream: TStream): stream is TVimeoStream => {
    return stream.type === 'vimeo';
};

export type TTwitchStream = z.infer<typeof twitchSchema>;
export const isTwitchStream = (stream: TStream): stream is TTwitchStream => {
    return stream.type === 'twitch';
};

export type TChurchStream = z.infer<typeof churchSchema>;
export const isChurchStream = (stream: TStream): stream is TChurchStream => {
    return stream.type === 'church';
};

export type TSrtStream = z.infer<typeof srtSchema>;
export const isSrtStream = (stream: TStream): stream is TSrtStream => {
    return stream.type === 'srt';
};

export type TDaCastStream = z.infer<typeof daCastSchema>;
export const isDaCastStream = (stream: TStream): stream is TDaCastStream => {
    return stream.type === 'da_cast';
};

export type THlsPullStream = z.infer<typeof hlsPullSchema>;
export const isHlsPullStream = (stream: TStream): stream is THlsPullStream => {
    return stream.type === 'hls_pull';
};

export type THlsPushStream = z.infer<typeof hlsPushSchema>;
export const isHlsPushStream = (stream: TStream): stream is THlsPushStream => {
    return stream.type === 'hls_push';
};

export type TWowzaStream = z.infer<typeof wowzaSchema>;
export const isWowzaStream = (stream: TStream): stream is TWowzaStream => {
    return stream.type === 'wowza';
};

export type TDailymotionStream = z.infer<typeof dailymotionSchema>;
export const isDailymotionStream = (stream: TStream): stream is TDailymotionStream => {
    return stream.type === 'dailymotion';
};

export type TIbmStream = z.infer<typeof ibmSchema>;
export const isIbmStream = (stream: TStream): stream is TIbmStream => {
    return stream.type === 'ibm';
};

export type TMicrosoftAzureStream = z.infer<typeof microsoftAzureSchema>;
export const isMicrosoftAzureStream = (stream: TStream): stream is TMicrosoftAzureStream => {
    return stream.type === 'microsoft_azure';
};

export type TMicrosoftStream = z.infer<typeof microsoftStreamSchema>;
export const isMicrosoftStream = (stream: TStream): stream is TMicrosoftStream => {
    return stream.type === 'microsoft_stream';
};

export type TGameChangerStream = z.infer<typeof gameChangerSchema>;
export const isGameChangerStream = (stream: TStream): stream is TGameChangerStream => {
    return stream.type === 'game_changer';
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
    file: File | string | null;
};

export const audioUrlSchema = z.object({
    fileUrl: z.string(),
    name: z.string(),
    storage: z.literal('url'),
});
export type TAudioUrlType = z.infer<typeof audioUrlSchema>;

export const audioLocalSchema = z.object({
    file: z.instanceof(File),
    name: z.string(),
    storage: z.enum(['flash', 'SD0']),
});
export type TAudioLocalType = z.infer<typeof audioLocalSchema>;
