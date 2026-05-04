import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const wowzaSchema = streamCommonSchema.extend({
    type: z.literal('wowza'),
});
