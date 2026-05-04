import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const youtubeSchema = streamCommonSchema.extend({
    type: z.literal('youtube'),
});
