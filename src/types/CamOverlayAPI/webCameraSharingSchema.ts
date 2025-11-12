import { z } from 'zod';
import { serviceNames, sharingSchema } from './serviceCommonTypes';

export const webCameraSharingSchema = sharingSchema.extend({
    name: z.literal(serviceNames.web_camera),
});
