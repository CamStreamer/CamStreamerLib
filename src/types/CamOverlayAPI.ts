import { HttpOptions } from '../internal/common';
import { z } from 'zod';
import { widgetListSchema, widgetsSchema } from '../models/CamOverlayAPI/widgetsSchema';
import { fileListSchema, fileSchema, storageSchema } from '../models/CamOverlayAPI/fileSchema';
import { fieldSchema } from '../models/CamOverlayAPI/customGraphics/schema';

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
