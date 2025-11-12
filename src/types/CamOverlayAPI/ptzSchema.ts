import { z } from 'zod';
import { serviceNames, overlaySchema, serviceCommonSchema } from './serviceCommonTypes';

export const ptzSchema = serviceCommonSchema.extend({
    name: z.literal(serviceNames.ptz),
    ptz_positions: z.record(
        z.string(),
        z.object({
            overlayList: z.array(overlaySchema.omit({ active: true, fps: true })),
            loop: z.boolean(),
        })
    ),
});
