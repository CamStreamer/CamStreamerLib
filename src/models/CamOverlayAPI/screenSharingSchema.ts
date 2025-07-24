import { allowedWidgetNames } from './constants';
import { sharingSchema } from './widgetCommonSchema';
import { z } from 'zod';

export const screenSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.screenSharing),
});
