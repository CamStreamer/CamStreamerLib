import { z } from 'zod';
import { allowedWidgetNames, overlaySchema, widgetCommonSchema } from './widgetCommonTypes';

export const ptzSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.ptz),
    ptz_positions: z.record(
        z.string(),
        z.object({
            overlayList: z.array(overlaySchema.omit({ active: true, fps: true })),
            loop: z.boolean(),
        })
    ),
});
