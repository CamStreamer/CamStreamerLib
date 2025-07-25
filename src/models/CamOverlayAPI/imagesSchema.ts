import { allowedWidgetNames } from './constants';
import { overlaySchema, widgetCommonSchema } from './widgetCommonSchema';

import { z } from 'zod';

export const imagesSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.images),
    overlayList: z.array(overlaySchema),
});
