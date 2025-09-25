import { z } from 'zod';
import { allowedWidgetNames, overlaySchema, widgetCommonSchema } from './widgetCommonTypes';

export const imagesSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.images),
    overlayList: z.array(overlaySchema),
});
