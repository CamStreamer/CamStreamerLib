import { sharingSchema, TWidget } from './CamOverlayAPI';
import { allowedWidgetNames } from '../../CamOverlayAPI';
import { z } from 'zod';

export const screenSharingSchema = sharingSchema.extend({
    name: z.literal(allowedWidgetNames.screenSharing),
});
export type TScreenSharing = z.infer<typeof screenSharingSchema>;
export const isScreenSharing = (widget: TWidget): widget is TScreenSharing => widget.name === 'screenSharing';
