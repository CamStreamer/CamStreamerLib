import { HttpOptions } from '../internal/common';
import { z } from 'zod';

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

export const serviceSchema = z.record(z.string(), z.any());
export type TService = z.infer<typeof serviceSchema>;
export type TServiceList = {
    services: TService[];
};

export const fieldSchema = z.object({
    field_name: z.string(),
    text: z.string(),
    color: z.string().optional(),
});
export type TField = z.infer<typeof fieldSchema>;

export const fileSchema = z.object({
    name: z.string(),
    path: z.string(),
    storage: z.string(),
});
export type TFile = z.infer<typeof fileSchema>;
export const fileListSchema = z.array(fileSchema);
export type TFileList = z.infer<typeof fileListSchema>;

export enum ImageType {
    PNG,
    JPEG,
}

export const fontStorageSchema = z.tuple([
    z.object({
        type: z.literal('SD0'),
        state: z.literal('SD Card'),
    }),
    z.object({
        type: z.literal('flash'),
        state: z.string(),
    }),
]);
export type TFontStorage = z.infer<typeof fontStorageSchema>;

export const imageStorageSchema = z.tuple([
    ...fontStorageSchema.items,
    z.object({
        type: z.literal('samba'),
        state: z.literal('Microsoft Network Share'),
    }),
    z.object({
        type: z.literal('url'),
        state: z.literal('URL'),
    }),
    z.object({
        type: z.literal('ftp'),
        state: z.literal('FTP'),
    }),
]);
export type TImageStorage = z.infer<typeof imageStorageSchema>;

export const storageSchema = z.union([fontStorageSchema, imageStorageSchema]);
export type TStorage = z.infer<typeof storageSchema>;
