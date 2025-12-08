import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const srtSchema = streamCommonSchema.extend({
    type: z.literal('srt'),
});
