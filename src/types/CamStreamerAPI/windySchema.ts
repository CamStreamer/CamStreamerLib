import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const windySchema = streamCommonSchema.extend({
    platform: z.literal('windy'),
    locationLat: z.number(),
    locationLon: z.number(),
    locationName: z.string(),
    direction: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).nullable(),
    position: z.union([z.literal('fix'), z.literal('rotating'), z.literal('controllable')]),
    webPageUrl: z.string(),
});

export type TWindyDirection = z.infer<typeof windySchema>['direction'];
export type TWindyPosition = z.infer<typeof windySchema>['position'];
