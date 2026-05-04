import { z } from 'zod';
import { serviceNames, overlaySchema, serviceCommonSchema } from './serviceCommonTypes';

export const imagesSchema = serviceCommonSchema.extend({
    name: z.literal(serviceNames.images),
    overlayList: z.array(overlaySchema),
});
