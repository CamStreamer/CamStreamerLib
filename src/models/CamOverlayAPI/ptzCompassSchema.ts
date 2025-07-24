import { allowedWidgetNames } from './constants';
import { coordinateSystemSchema, widgetCommonSchema } from './widgetCommonSchema';

import { z } from 'zod';

export const ptzCompassSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.ptzCompass),
    pos_x: z.number(),
    pos_y: z.number(),
    coordSystem: coordinateSystemSchema,
    scale: z.number().nonnegative(),
    type: z.union([z.literal('compass'), z.literal('map'), z.literal('image')]),
    image: z.union([z.string().url(), z.literal('')]), // file:///usr/local/packages/camoverlay/localdata/user_images/vodnik-1.png
    northPan: z.number(), // Pan in degrees
    cameraPosX: z.number(), // Used only if type is 'map' or 'image'
    cameraPosY: z.number(),
    colorScheme: z.enum(['black', 'white', 'orange']),
    generalLng: z.number().optional(),
    generalLat: z.number().optional(),
    generalZoom: z.number().nonnegative().optional(),
    generalMapType: z.string().optional(),
    generalIframeWidth: z.number().optional(),
    generalIframeHeight: z.number().optional(),
    generalAddress: z.string().optional(),
});
