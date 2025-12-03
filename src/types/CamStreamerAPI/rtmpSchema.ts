import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const rtmpSchema = streamCommonSchema.extend({
    type: z.literal('rtmp'),
    rtmpUrl: z.string().url(),
    streamKey: z.string(),
    streamIdentifier: z.string().optional(),
});
