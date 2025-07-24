import { allowedWidgetNames } from './constants';
import { sharingSchema } from './widgetCommonSchema';
import { z } from 'zod';

export const webCameraSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.web_camera),
});
