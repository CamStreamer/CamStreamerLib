import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const hlsPushSchema = streamCommonSchema.extend({
    type: z.literal('hls_push'),
});
