import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const microsoftStreamSchema = streamCommonSchema.extend({
    type: z.literal('microsoft_stream'),
});
