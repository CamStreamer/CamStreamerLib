import { allowedWidgetNames } from './constants';
import { coordinateSystemSchema, fontSchema, widgetCommonSchema } from './widgetCommonSchema';

import { z } from 'zod';

const mappingZonesCommonSchema = z.object({
    name: z.string(),
    pos_x: z.number(),
    pos_y: z.number(),
    text: z
        .array(
            z.object({
                source: z.string(),
                active: z.boolean(),
            })
        )
        .optional(),
    wrapText: z.boolean(),
    textLines: z.number().positive(),
    textWidth: z.number().nonnegative(),
    textAlign: z.union([z.literal('A_LEFT'), z.literal('A_CENTER'), z.literal('A_RIGHT')]),
    textVerticalAlign: z.union([z.literal('VA_TOP'), z.literal('VA_CENTER'), z.literal('VA_BOTTOM')]),
    textColor: z.string(),
    font: fontSchema,
    fontSize: z.number().nonnegative(),
    switchingTime: z.number().nonnegative(),
});

export const mappingZonesCountdownSettingsSchema = z.object({
    startDate: z.number().nonnegative(),
    targetDate: z.number().nonnegative(),
    countdown: z.boolean(),
    countup: z.boolean(),
    displayDay: z.boolean(),
    displayHour: z.boolean(),
    displayMinute: z.boolean(),
    displaySeconds: z.boolean(),
    idleText: z.string(),
    hideZeros: z.boolean(),
    delimiter: z.union([z.literal('colon'), z.literal('letters')]),
    suffixSeconds: z.string(),
    suffixMinute: z.string(),
    suffixHour: z.string(),
    suffixDay: z.string(),
    loop: z.boolean(),
    loopPeriod: z.number().nonnegative(),
    waitingPeriod: z.number().nonnegative(),
});
const mappingZonePlainSchema = mappingZonesCommonSchema.extend({
    type: z.literal('plain'),
});
const mappingZoneCountdownSchema = mappingZonesCommonSchema.extend({
    type: z.literal('countdown'),
    settings: mappingZonesCountdownSettingsSchema,
});

export const mappingZoneSchema = z.discriminatedUnion('type', [mappingZonePlainSchema, mappingZoneCountdownSchema]);
const customGraphicsSchemaUnnamed = z.object({
    pos_x: z.number(),
    pos_y: z.number(),
    coordSystem: coordinateSystemSchema,
    clockFormat: z.union([z.literal('12h'), z.literal('24h')]),
    background: z.enum(['custom', 'image']),
    image: z.string(),
    customAreaColor: z.string(),
    customAreaWidth: z.number().nonnegative(),
    customAreaHeight: z.number().nonnegative(),
    customAreaCorners: z.union([z.literal('sharp'), z.literal('rounded')]),
    mappingZones: z.array(mappingZoneSchema),
});
export const customGraphicsDeprecatedSchema = widgetCommonSchema.merge(customGraphicsSchemaUnnamed).extend({
    name: z.literal('textAndBackground'),
});

export const customGraphicsSchema = widgetCommonSchema.merge(customGraphicsSchemaUnnamed).extend({
    name: z.literal(allowedWidgetNames.customGraphics),
});

export const fieldSchema = z.object({
    field_name: z.string(),
    text: z.string(),
    color: z.string().optional(),
});
