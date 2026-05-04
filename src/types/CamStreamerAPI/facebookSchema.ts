import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const facebookSchema = streamCommonSchema.extend({
    type: z.literal('facebook'),
});
