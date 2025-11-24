import z from 'zod';
import { STREAM_TYPES, streamCommonSchema } from './streamCommonTypes';

export const rtmpSchema = streamCommonSchema.extend({
    type: z.literal(STREAM_TYPES.rtmp),
});
