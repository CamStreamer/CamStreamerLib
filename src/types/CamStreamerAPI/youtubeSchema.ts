import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const youtubeSchema = streamCommonSchema.extend({
    platform: z.literal('youtube'),
    description: z.string().optional(),
    playlists: z.array(z.string()),
    tags: z.array(z.string()),
    notificationEmails: z.array(z.string().email()),
    streamPrivacy: z.union([z.literal('public'), z.literal('unlisted'), z.literal('private')]),
    latency: z.union([z.literal('normal'), z.literal('low'), z.literal('ultra_low')]),
    afterEndStatus: z.union([z.literal('no_change'), z.literal('public'), z.literal('unlisted'), z.literal('private')]),
    dvr: z.boolean(),
    hasWatchdogs: z.boolean(),
    countdown: z.boolean(),
    streamingProtocol: z.union([z.literal('RTMP'), z.literal('RTMPS'), z.literal('HLS')]),
});
export type TYouTubeStreamingProtocolType = z.infer<typeof youtubeSchema>['streamingProtocol'];
