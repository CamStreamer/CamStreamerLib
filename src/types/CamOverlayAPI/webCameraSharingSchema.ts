import { sharingSchema, TWidget } from './CamOverlayAPI';
import { allowedWidgetNames } from '../../CamOverlayAPI';

import { z } from 'zod';

export const webCameraSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.web_camera),
});
export type TWebCameraSharing = z.infer<typeof webCameraSharingSchema>;
export const isWebCameraSharing = (widget: TWidget): widget is TWebCameraSharing => widget.name === 'web_camera';
