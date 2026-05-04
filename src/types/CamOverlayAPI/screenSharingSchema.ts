import { z } from 'zod';
import { serviceNames, sharingSchema } from './serviceCommonTypes';

export const screenSharingSchema = sharingSchema.extend({
    name: z.literal(serviceNames.screenSharing),
});
