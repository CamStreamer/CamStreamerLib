import z from 'zod';
import { STREAM_TYPES, streamCommonSchema } from './streamCommonTypes';

export const hlsSchema = streamCommonSchema.extend({
    type: z.literal(STREAM_TYPES.hls),
});
