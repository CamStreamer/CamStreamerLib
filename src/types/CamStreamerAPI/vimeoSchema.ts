import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const vimeoSchema = streamCommonSchema.extend({
    type: z.literal('vimeo'),
});
