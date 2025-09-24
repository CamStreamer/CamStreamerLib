import { overlaySchema, TWidget, widgetCommonSchema } from './CamOverlayAPI';
import { allowedWidgetNames } from '../../CamOverlayAPI';

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
export type TPtz = z.infer<typeof ptzSchema>;
export const isPtz = (widget: TWidget): widget is TPtz => widget.name === 'ptz';
