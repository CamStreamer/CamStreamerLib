import { allowedWidgetNames } from '../constants';
import {
    coordinateSystemSchema,
    fontSchema,
    languageSchema,
    weatherUnitSchema,
    widgetCommonSchema,
} from '../shared/schema';

import { z } from 'zod';

export const accuweatherSchema = widgetCommonSchema.extend({
    name: z.literal(allowedWidgetNames.accuweather),
    location: z.string(), // Location key
    locationName: z.string(), // Title from location api
    title: z.string(), // Title from user
    bgStartColor: z.union([
        z.literal('237,143,73,0.93'),
        z.literal('0,0,0,0.75'),
        z.literal('31,32,73,0.9'),
        z.literal('76,94,127,0.95'),
    ]),
    bgEndColor: z.union([
        z.literal('234,181,89,0.93'),
        z.literal('0,0,0,0.75'),
        z.literal('73,96,213,0.9'),
        z.literal('140,150,168,0.95'),
    ]),
    clockType: z.union([z.literal('12h'), z.literal('24h')]), // 12h|24h format
    lang: languageSchema,
    font: fontSchema,
    units: weatherUnitSchema,
    pos_x: z.number(),
    pos_y: z.number(),
    coordSystem: coordinateSystemSchema,
    layout: z.union([
        z.literal('0'),
        z.literal('1'),
        z.literal('2'),
        z.literal('3'),
        z.literal('4'),
        z.literal('5'),
        z.literal('6'),
        z.literal('7'),
        z.literal('8'),
        z.literal('9'),
        z.literal('10'),
        z.literal('11'),
        z.literal('12'),
        z.literal('13'),
    ]),
    scale: z.number().nonnegative(),
});
