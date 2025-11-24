import z from 'zod';
import { STREAM_TYPES, streamCommonSchema } from './streamCommonTypes';

export const windySchema = streamCommonSchema.extend({
    type: z.literal(STREAM_TYPES.windy),
});
