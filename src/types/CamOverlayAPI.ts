import { HttpOptions } from '../internal/common';
import { z } from 'zod';
import { widgetListSchema, widgetsSchema } from '../models/CamOverlayAPI/widgetsSchema';
import { fileListSchema, fileSchema, storageSchema } from '../models/CamOverlayAPI/fileSchema';
import { customGraphicsSchema, fieldSchema } from '../models/CamOverlayAPI/customGraphicsSchema';
import {
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    ptzSchema,
    pipSchema,
    screenSharingSchema,
    webCameraSharingSchema,
} from '../models/CamOverlayAPI';

export type CamOverlayOptions = HttpOptions;

export type TFileType = 'image' | 'font';
export type TCoordinates =
    | 'top_left'
    | 'top_right'
    | 'top'
    | 'bottom_left'
    | 'bottom_right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | '';

export type TWidget = z.infer<typeof widgetsSchema>;
export type TWidgetList = z.infer<typeof widgetListSchema>;

export type TField = z.infer<typeof fieldSchema>;

export type TFile = z.infer<typeof fileSchema>;
export type TFileList = z.infer<typeof fileListSchema>;
export enum ImageType {
    PNG,
    JPEG,
}

export type TStorage = z.infer<typeof storageSchema>;

export type TInfoticker = z.infer<typeof infoTickerSchema>;
export type TAccuweather = z.infer<typeof accuweatherSchema>;
export type TPtzCompass = z.infer<typeof ptzCompassSchema>;
export type TImages = z.infer<typeof imagesSchema>;
export type TPtz = z.infer<typeof ptzSchema>;
export type TPip = z.infer<typeof pipSchema>;
export type TCustomGraphics = z.infer<typeof customGraphicsSchema>;
export type TScreenSharing = z.infer<typeof screenSharingSchema>;
export type TWebCameraSharing = z.infer<typeof webCameraSharingSchema>;

export const isInfoticker = (widget: TWidget): widget is TInfoticker => widget.name === 'infoticker';

export const isAccuweather = (widget: TWidget): widget is TAccuweather => widget.name === 'accuweather';

export const isPtzCompass = (widget: TWidget): widget is TPtzCompass => widget.name === 'ptzCompass';

export const isImages = (widget: TWidget): widget is TImages => widget.name === 'images' || widget.name === 'custom';

export const isPtz = (widget: TWidget): widget is TPtz => widget.name === 'ptz';

export const isPip = (widget: TWidget): widget is TPip => widget.name === 'pip';

export const isCustomGraphics = (widget: TWidget): widget is TCustomGraphics => widget.name === 'customGraphics';

export const isScreenSharing = (widget: TWidget): widget is TScreenSharing => widget.name === 'screenSharing';

export const isWebCameraSharing = (widget: TWidget): widget is TWebCameraSharing => widget.name === 'web_camera';
