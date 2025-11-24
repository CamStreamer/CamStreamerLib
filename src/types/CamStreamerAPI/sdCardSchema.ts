import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const sdCardSchema = streamCommonSchema.extend({
    type: z.literal('sd_card'),
});
