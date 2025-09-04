import { allowedWidgetNames } from './constants';
import { overlaySchema, widgetCommonSchema } from './widgetCommonSchema';

import { z } from 'zod';

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
