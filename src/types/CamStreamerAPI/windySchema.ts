import z from 'zod';
import { streamCommonSchema } from './streamCommonTypes';

export const windySchema = streamCommonSchema.extend({
    platform: z.literal('windy'),
    locationLat: z.number(),
    locationLon: z.number(),
    locationName: z.string(),
    locationAddress: z.string(),
    mapZoom: z.number(),
    direction: z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']).nullable(),
    position: z.union([z.literal('fix'), z.literal('rotating'), z.literal('controllable')]),
    webPageUrl: z.string(),
    mediaServerUrl: z.string().nullable(),
});

export type TWindyDirection = z.infer<typeof windySchema>['direction'];
export type TWindyPosition = z.infer<typeof windySchema>['position'];
