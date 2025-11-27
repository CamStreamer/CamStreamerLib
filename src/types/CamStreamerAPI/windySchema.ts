import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const windySchema = streamCommonSchema.extend({
    type: z.literal('windy'),
});
