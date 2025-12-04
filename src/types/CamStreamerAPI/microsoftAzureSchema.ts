import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const microsoftAzureSchema = streamCommonSchema.extend({
    type: z.literal('microsoft_azure'),
});
