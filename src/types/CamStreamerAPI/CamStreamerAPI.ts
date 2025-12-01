import { z } from 'zod';
import { facebookSchema } from './facebookSchema';
import { hlsSchema } from './hlsSchema';
import { mpegDvbSchema } from './mpegDvbSchema';
import { rtmpSchema } from './rtmpSchema';
import { sdCardSchema } from './sdCardSchema';
import { windySchema } from './windySchema';
import { youtubeSchema } from './youtubeSchema';

//   ----------------------------------------
//                    Streams
//   ----------------------------------------

export const streamSchema = z.discriminatedUnion('type', [
    facebookSchema,
    hlsSchema,
    mpegDvbSchema,
    rtmpSchema,
    sdCardSchema,
    windySchema,
    youtubeSchema,
]);
export type TStream = z.infer<typeof streamSchema>;

export const streamListSchema = z.object({ streamList: z.array(streamSchema) });
export type TStreamList = z.infer<typeof streamListSchema>;

export type TFacebookStream = z.infer<typeof facebookSchema>;
export const isFacebookStream = (stream: TStream): stream is TFacebookStream => {
    return stream.type === 'facebook';
};

export type THlsStream = z.infer<typeof hlsSchema>;
export const isHlsStream = (stream: TStream): stream is THlsStream => {
    return stream.type === 'hls';
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

//   ----------------------------------------
//               Storage & Files
//   ----------------------------------------

export enum AudioType {
    MP3,
    AAC,
}

export const audioFileStorageTypeSchema = z.union([z.literal('flash'), z.literal('SD0'), z.literal('url')]);
export type TAudioFileStorageType = z.infer<typeof audioFileStorageTypeSchema>;
export type TLocalStorageType = 'local' | 'url';

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

export const audioFileDataSchema = z.object({
    code: z.number(),
    list: audioFileListSchema,
});
export type TAudioFileData = z.infer<typeof audioFileDataSchema>;
