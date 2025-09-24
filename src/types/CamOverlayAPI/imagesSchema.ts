import { overlaySchema, TWidget, widgetCommonSchema } from './CamOverlayAPI';
import { allowedWidgetNames } from '../../CamOverlayAPI';

import { z } from 'zod';

export const imagesSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.images),
    overlayList: z.array(overlaySchema),
});
export type TImages = z.infer<typeof imagesSchema>;
export const isImages = (widget: TWidget): widget is TImages => widget.name === 'images';
