import { allowedWidgetNames } from '../constants';
import { overlaySchema, widgetCommonSchema } from '../shared/schema';

import { z } from 'zod';

const imagesSchemaUnnamed = z.object({
    overlayList: z.array(overlaySchema),
});
export const imagesSchemaDeprecated = widgetCommonSchema.merge(imagesSchemaUnnamed).extend({
    name: z.literal('custom'),
});

export const imagesSchema = widgetCommonSchema.merge(imagesSchemaUnnamed).extend({
    name: z.literal(allowedWidgetNames.images),
});
