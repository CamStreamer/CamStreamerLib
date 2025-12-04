import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const twitchSchema = streamCommonSchema.extend({
    type: z.literal('twitch'),
});
