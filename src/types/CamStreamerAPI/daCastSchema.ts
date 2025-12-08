import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const daCastSchema = streamCommonSchema.extend({
    type: z.literal('da_cast'),
});
