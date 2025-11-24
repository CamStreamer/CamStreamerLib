import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const mpegDvbSchema = streamCommonSchema.extend({
    type: z.literal('mpeg_dvb'),
});
