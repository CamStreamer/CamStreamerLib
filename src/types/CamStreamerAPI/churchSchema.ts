import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const churchSchema = streamCommonSchema.extend({
    type: z.literal('church'),
});
