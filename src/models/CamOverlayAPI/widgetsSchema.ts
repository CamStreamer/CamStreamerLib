import { customGraphicsDeprecatedSchema, customGraphicsSchema } from './customGraphics/schema';
import { imagesSchema, imagesSchemaDeprecated } from './images/schema';

import { accuweatherSchema } from './accuweather/schema';
import { infoTickerSchema } from './infoticker/schema';
import { pipSchema } from './pip/schema';
import { ptzCompassSchema } from './ptzCompass/schema';
import { ptzSchema } from './ptz/schema';
import { screenSharingSchema } from './screenSharing/schema';
import { webCameraSharingSchema } from './webCameraSharing/schema';
import { z } from 'zod';

export const widgetsSchema = z.discriminatedUnion('name', [
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    imagesSchemaDeprecated,
    ptzSchema,
    pipSchema,
    customGraphicsSchema,
    customGraphicsDeprecatedSchema,
    screenSharingSchema,
    webCameraSharingSchema,
]);
export const widgetListSchema = z.object({
    services: z.array(widgetsSchema),
});
