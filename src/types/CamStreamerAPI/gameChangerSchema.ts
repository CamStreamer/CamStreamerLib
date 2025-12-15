import z from 'zod';
import { commonRtmpSchema } from './rtmpSchema';

export const gameChangerSchema = commonRtmpSchema.extend({
    type: z.literal('game_changer'),
});
