import z from 'zod';
import { STREAM_TYPES, streamCommonSchema } from './streamCommonTypes';

export const facebookSchema = streamCommonSchema.extend({
    type: z.literal(STREAM_TYPES.facebook),
});
