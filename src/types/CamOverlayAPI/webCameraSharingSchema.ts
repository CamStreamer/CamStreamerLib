import { z } from 'zod';
import { allowedWidgetNames, sharingSchema } from './widgetCommonTypes';

export const webCameraSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.web_camera),
});
