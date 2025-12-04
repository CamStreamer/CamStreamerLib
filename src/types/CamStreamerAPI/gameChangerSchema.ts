import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const gameChangerSchema = streamCommonSchema.extend({
    type: z.literal('game_changer'),
});
