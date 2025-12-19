import z from 'zod';
import { commonRtmpSchema } from './rtmpSchema';

export const youtubeRtmpSchema = commonRtmpSchema.extend({
    type: z.literal('youtube_rtmp'),
});
