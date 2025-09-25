import { z } from 'zod';
import { allowedWidgetNames, sharingSchema } from './widgetCommonTypes';

export const screenSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.screenSharing),
});
