import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const dailymotionSchema = streamCommonSchema.extend({
    type: z.literal('dailymotion'),
});
