import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const hlsPullSchema = streamCommonSchema.extend({
    type: z.literal('hls_pull'),
});
