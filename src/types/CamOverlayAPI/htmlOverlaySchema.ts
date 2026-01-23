import { z } from 'zod';
import { serviceNames, serviceCommonSchema, coordinateSystemSchema } from './serviceCommonTypes';

export const htmlOverlaySchema = serviceCommonSchema.extend({
    name: z.literal(serviceNames.htmlOverlay),
    pos_x: z.number().nonnegative(),
    pos_y: z.number().nonnegative(),
    coordSystem: coordinateSystemSchema,
    url: z.string().url().or(z.literal('')).default(''),
    pageWidth: z.number().nonnegative(),
    pageHeight: z.number().nonnegative(),
    fps: z.number().nonnegative(),
    scale: z.number(),
    cropEnabled: z.boolean(),
    cropLeft: z.number().nonnegative(),
    cropTop: z.number().nonnegative(),
    cropWidth: z.number().nonnegative(),
    cropHeight: z.number().nonnegative(),
});
