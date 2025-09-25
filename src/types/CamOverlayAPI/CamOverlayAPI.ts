import { HttpOptions } from '../../internal/types';
import { z } from 'zod';
import { customGraphicsSchema } from './customGraphicsSchema';
import {
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    ptzSchema,
    pipSchema,
    screenSharingSchema,
    webCameraSharingSchema,
} from './index';

export const WSResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
    data: z.string(),
});
export type TWSResponse = z.infer<typeof WSResponseSchema>;

//   ----------------------------------------
//                   Common
//   ----------------------------------------

export const coordinateSystemSchema = z.union([
    z.literal('top_left'),
    z.literal('top'),
    z.literal('top_right'),
    z.literal('left'),
    z.literal('center'),
    z.literal('right'),
    z.literal('bottom_left'),
    z.literal('bottom'),
    z.literal('bottom_right'),
]);
export type TCoordinates = z.infer<typeof coordinateSystemSchema> | '';

export const languageSchema = z.union([
    z.literal('en-us'),
    z.literal('fr-fr'),
    z.literal('ja-jp'),
    z.literal('pt-pt'),
    z.literal('es-es'),
    z.literal('de-de'),
    z.literal('ko-kr'),
    z.literal('zh-hk'),
    z.literal('zh-cn'),
    z.literal('nl-nl'),
    z.literal('cs-cz'),
    z.literal('ru-ru'),
    z.literal('sv-se'),
]);
export type TLanguage = z.infer<typeof languageSchema>;

export const fontSchema = z.union([
    z.literal('classic'),
    z.literal('digital'),
    z.custom<string>((val) => {
        return typeof val === 'string';
    }),
]);
export type TFont = z.infer<typeof fontSchema>;

export const weatherUnitSchema = z.union([z.literal('Metric'), z.literal('Imperial')]);
export type TWeatherUnit = z.infer<typeof weatherUnitSchema>;

//   ----------------------------------------
//                   Widgets
//   ----------------------------------------

export const widgetCommonSchema = z.object({
    id: z.number().nonnegative(),
    enabled: z.union([z.literal(0), z.literal(1)]),
    automationType: z.union([
        z.literal('time'),
        z.literal('manual'),
        z.literal('schedule'),
        z.custom<`input${number}`>((val) => {
            return typeof val === 'string' ? /^input\d+$/.test(val) : false;
        }),
    ]),
    invertInput: z.boolean().optional(),
    cameraList: z.array(z.number()),
    camera: z.number().nonnegative().optional(), // Deprecated, may still exist in old versions of CO
    schedule: z.string().optional(),
    customName: z.string(),
    zIndex: z.number().optional(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
});

export const widgetsSchema = z.discriminatedUnion('name', [
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    ptzSchema,
    pipSchema,
    customGraphicsSchema,
    screenSharingSchema,
    webCameraSharingSchema,
]);
export type TWidget = z.infer<typeof widgetsSchema>;

export const widgetListSchema = z.object({
    services: z.array(widgetsSchema),
});
export type TWidgetList = z.infer<typeof widgetListSchema>;

export const sharingSchema = widgetCommonSchema.extend({
    pos_x: z.number().nonnegative(),
    pos_y: z.number().nonnegative(),
    coordSystem: coordinateSystemSchema,
    screenSize: z.number().positive(),
    fps: z.number(),
});

export const overlaySchema = z.object({
    active: z.boolean(),
    coordSystem: coordinateSystemSchema,
    pos_x: z.number(),
    pos_y: z.number(),
    imgPath: z.string(),
    imgName: z.string(),
    duration: z.number(),
    scale: z.number(),
    fps: z.number().optional(),
});

//   ----------------------------------------
//               Storage & Files
//   ----------------------------------------

export type TFileType = 'image' | 'font';
export enum ImageType {
    PNG,
    JPEG,
}

export const storageSchema = z.union([
    z.literal('flash'),
    z.literal('SD0'),
    z.literal('ftp'),
    z.literal('samba'),
    z.literal('url'),
]);
export type TStorage = z.infer<typeof storageSchema>;

export const storageDataListSchema = z.array(
    z.object({
        type: storageSchema,
        state: z.string(),
    })
);
export type TStorageDataList = z.infer<typeof storageDataListSchema>;

export const storageResponseSchema = z.object({
    code: z.number(),
    list: storageDataListSchema,
});
export type TStorageResponse = z.infer<typeof storageResponseSchema>;

export const fileSchema = z.object({
    name: z.string(),
    path: z.string().url(),
    storage: storageSchema,
});
export type TFile = z.infer<typeof fileSchema>;

export const fileListSchema = z.array(fileSchema);
export type TFileList = z.infer<typeof fileListSchema>;

export const fileDataSchema = z.object({
    code: z.number(),
    list: fileListSchema,
});
export type TFileData = z.infer<typeof fileDataSchema>;
