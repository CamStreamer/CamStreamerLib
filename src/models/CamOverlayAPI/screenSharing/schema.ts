import { allowedWidgetNames } from '../constants';
import { sharingSchema } from '../shared/schema';
import { z } from 'zod';

export const screenSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.screenSharing),
});
