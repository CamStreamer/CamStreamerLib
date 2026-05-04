import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const rtmpSchema = streamCommonSchema.extend({
    type: z.literal('rtmp'),
    outputUrl: z.string(),
    streamKey: z.string(),
    streamIdentifier: z.string().optional(),
});
