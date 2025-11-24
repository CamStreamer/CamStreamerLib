import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const hlsSchema = streamCommonSchema.extend({
    type: z.literal('hls'),
});
