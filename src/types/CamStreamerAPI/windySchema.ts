import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const windySchema = streamCommonSchema.extend({
    platform: z.literal('windy'),
});
