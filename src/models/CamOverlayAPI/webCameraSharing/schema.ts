import { allowedWidgetNames } from '../constants';
import { sharingSchema } from '../shared/schema';
import { z } from 'zod';

export const webCameraSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.web_camera),
});
