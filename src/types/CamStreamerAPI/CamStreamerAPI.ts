import { z } from 'zod';
import { facebookSchema } from './facebookSchema';
import { hlsSchema } from './hlsSchema';
import { mpegDvbSchema } from './mpegDvbSchema';
import { rtmpSchema } from './rtmpSchema';
import { sdCardSchema } from './sdCardSchema';
import { windySchema } from './windySchema';
import { youtubeSchema } from './youtubeSchema';

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
