import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const commonRtmpSchema = streamCommonSchema.extend({
    streamKey: z.string(),
    streamIdentifier: z.string().optional(),
});

export const churchSchema = streamCommonSchema.extend({
    platform: z.literal('church'),
});
export const daCastSchema = streamCommonSchema.extend({
    platform: z.literal('da_cast'),
});
export const dailymotionSchema = streamCommonSchema.extend({
    platform: z.literal('dailymotion'),
});
export const gameChangerSchema = commonRtmpSchema.extend({
    platform: z.literal('game_changer'),
});
export const hlsPullSchema = streamCommonSchema.extend({
    platform: z.literal('hls_pull'),
});
export const hlsPushSchema = streamCommonSchema.extend({
    platform: z.literal('hls_push'),
});
export const ibmSchema = streamCommonSchema.extend({
    platform: z.literal('ibm'),
});
export const mpegDvbSchema = streamCommonSchema.extend({
    platform: z.literal('mpeg_dvb'),
});
export const microsoftAzureSchema = streamCommonSchema.extend({
    platform: z.literal('microsoft_azure'),
});
export const microsoftStreamSchema = streamCommonSchema.extend({
    platform: z.literal('microsoft_stream'),
});
export const rtmpSchema = commonRtmpSchema.extend({
    platform: z.literal('rtmp'),
});
export const sdCardSchema = streamCommonSchema.extend({
    platform: z.literal('sd_card'),
});
export const srtSchema = streamCommonSchema.extend({
    platform: z.literal('srt'),
});
export const twitchSchema = streamCommonSchema.extend({
    platform: z.literal('twitch'),
});
export const vimeoSchema = streamCommonSchema.extend({
    platform: z.literal('vimeo'),
});
export const wowzaSchema = streamCommonSchema.extend({
    platform: z.literal('wowza'),
});
export const youtubeRtmpSchema = commonRtmpSchema.extend({
    platform: z.literal('youtube_rtmp'),
});
