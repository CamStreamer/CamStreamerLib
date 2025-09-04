import { customGraphicsSchema } from './customGraphicsSchema';
import { imagesSchema } from './imagesSchema';

import { accuweatherSchema } from './accuweatherSchema';
import { infoTickerSchema } from './infotickerSchema';
import { pipSchema } from './pipSchema';
import { ptzCompassSchema } from './ptzCompassSchema';
import { ptzSchema } from './ptzSchema';
import { screenSharingSchema } from './screenSharingSchema';
import { webCameraSharingSchema } from './webCameraSharingSchema';
import { z } from 'zod';

export const widgetsSchema = z.discriminatedUnion('name', [
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    ptzSchema,
    pipSchema,
    customGraphicsSchema,
    screenSharingSchema,
    webCameraSharingSchema,
]);
export const widgetListSchema = z.object({
    services: z.array(widgetsSchema),
});
