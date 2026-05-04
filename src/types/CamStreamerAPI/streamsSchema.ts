import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const streamPlatforms = {
    da_cast: 'da_cast',
    dailymotion: 'dailymotion',
    facebook_rtmp: 'facebook_rtmp',
    game_changer: 'game_changer',
    hls_pull: 'hls_pull',
    hls_push: 'hls_push',
    ibm: 'ibm',
    mpeg_dvb: 'mpeg_dvb',
    microsoft_azure: 'microsoft_azure',
    microsoft_stream: 'microsoft_stream',
    rtmp: 'rtmp',
    sd_card: 'sd_card',
    srt: 'srt',
    twitch: 'twitch',
    vimeo: 'vimeo',
    wowza: 'wowza',
    youtube_rtmp: 'youtube_rtmp',
    windy: 'windy',
    youtube: 'youtube',
    facebook: 'facebook',
} as const;

export const daCastSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.da_cast),
});
export const dailymotionSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.dailymotion),
});
export const facebookRtmpSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.facebook_rtmp),
});
export const gameChangerSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.game_changer),
});
export const hlsPullSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.hls_pull),
});
export const hlsPushSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.hls_push),
});
export const ibmSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.ibm),
});
export const mpegDvbSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.mpeg_dvb),
});
export const microsoftAzureSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.microsoft_azure),
});
export const microsoftStreamSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.microsoft_stream),
});
export const rtmpSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.rtmp),
});
export const sdCardSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.sd_card),
});
export const srtSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.srt),
});
export const twitchSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.twitch),
});
export const vimeoSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.vimeo),
});
export const wowzaSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.wowza),
});
export const youtubeRtmpSchema = streamCommonSchema.extend({
    platform: z.literal(streamPlatforms.youtube_rtmp),
});
