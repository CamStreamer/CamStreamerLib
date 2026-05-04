import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const ibmSchema = streamCommonSchema.extend({
    type: z.literal('ibm'),
});
