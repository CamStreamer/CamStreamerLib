import { allowedWidgetNames } from '../constants';
import { fontSchema, languageSchema, weatherUnitSchema, widgetCommonSchema } from '../shared/schema';

import { z } from 'zod';

export const infoTickerSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.infoticker),
    showClock: z.union([z.literal(0), z.literal(1)]),
    clockType: z.union([z.literal('12h'), z.literal('24h')]),
    textColor: z.string(),
    bgColor: z.string(),
    weatherLocation: z.string(), // Location key
    weatherLocationName: z.string(), // Title from location api
    weatherLang: languageSchema,
    weatherUnits: weatherUnitSchema,
    numberOfLines: z.number().positive(),
    switchingTime: z.number().nonnegative(),
    crawlLeft: z.boolean(),
    crawlSpeed: z.number(),
    coordSystem: z.union([z.literal('top'), z.literal('bottom')]),
    pos_y: z.number(), // In percentage
    font: fontSchema,
    fontSize: z.number().nonnegative(),
    sourceType: z.union([z.literal('text'), z.literal('url')]),
    source: z.string(),
});
