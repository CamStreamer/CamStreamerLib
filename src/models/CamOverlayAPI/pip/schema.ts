import { allowedWidgetNames } from '../constants';
import { coordinateSystemSchema, requiredNumberSchema, widgetCommonSchema } from '../shared/schema';

import { z } from 'zod';

export const pipSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.pip),
    coordSystem: coordinateSystemSchema,
    pos_x: z.number(),
    pos_y: z.number(),
    fps: requiredNumberSchema,
    compression: z.number().nonnegative(),
    screenSize: z.number().nonnegative(),
    source_type: z.union([z.literal('axis_camera'), z.literal('mjpeg_url')]),
    mjpeg_url: z.union([z.string().url(), z.literal('')]),
    camera_ip: z.union([z.string().ip({ message: 'Invalid IP address' }), z.literal('')]),
    camera_port: z.number().nonnegative(),
    camera_user: z.string(),
    camera_pass: z.string(),
    camera_width: z.number().nonnegative(),
    camera_height: z.number().nonnegative(),
    camera_view_area: z.string(),
    camera_overlay_params: z.union([
        z.literal('overlays=off'),
        z.literal('overlays=all'),
        z.literal('overlays=text'),
        z.literal('overlays=image'),
        z.literal('overlays=application'),
    ]),
    rotate: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
    dewarping: z.object({
        enabled: z.boolean(),
        rectangle: z.array(z.tuple([z.number(), z.number()])),
        aspectRatioCorrection: requiredNumberSchema,
    }),
    borderColor: z.string(),
    borderWidth: z.number(),
    scale: requiredNumberSchema,
});
