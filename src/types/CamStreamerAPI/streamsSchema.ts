import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const commonRtmpSchema = streamCommonSchema.extend({
    streamKey: z.string(),
    streamIdentifier: z.string().optional(),
});

export const churchSchema = streamCommonSchema.extend({
    type: z.literal('church'),
});
export const daCastSchema = streamCommonSchema.extend({
    type: z.literal('da_cast'),
});
export const dailymotionSchema = streamCommonSchema.extend({
    type: z.literal('dailymotion'),
});
export const gameChangerSchema = commonRtmpSchema.extend({
    type: z.literal('game_changer'),
});
export const hlsPullSchema = streamCommonSchema.extend({
    type: z.literal('hls_pull'),
});
export const hlsPushSchema = streamCommonSchema.extend({
    type: z.literal('hls_push'),
});
export const ibmSchema = streamCommonSchema.extend({
    type: z.literal('ibm'),
});
export const mpegDvbSchema = streamCommonSchema.extend({
    type: z.literal('mpeg_dvb'),
});
export const microsoftAzureSchema = streamCommonSchema.extend({
    type: z.literal('microsoft_azure'),
});
export const microsoftStreamSchema = streamCommonSchema.extend({
    type: z.literal('microsoft_stream'),
});
export const rtmpSchema = commonRtmpSchema.extend({
    type: z.literal('rtmp'),
});
export const sdCardSchema = streamCommonSchema.extend({
    type: z.literal('sd_card'),
});
export const srtSchema = streamCommonSchema.extend({
    type: z.literal('srt'),
});
export const twitchSchema = streamCommonSchema.extend({
    type: z.literal('twitch'),
});
export const vimeoSchema = streamCommonSchema.extend({
    type: z.literal('vimeo'),
});
export const wowzaSchema = streamCommonSchema.extend({
    type: z.literal('wowza'),
});
export const youtubeRtmpSchema = commonRtmpSchema.extend({
    type: z.literal('youtube_rtmp'),
});
