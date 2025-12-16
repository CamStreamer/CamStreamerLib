import { z } from 'zod';
import { infoTickerSchema } from './infotickerSchema';
import { accuweatherSchema } from './accuweatherSchema';
import { ptzCompassSchema } from './ptzCompassSchema';
import { imagesSchema } from './imagesSchema';
import { ptzSchema } from './ptzSchema';
import { pipSchema } from './pipSchema';
import { customGraphicsSchema } from './customGraphicsSchema';
import { screenSharingSchema } from './screenSharingSchema';
import { webCameraSharingSchema } from './webCameraSharingSchema';
import { overlaySchema } from './serviceCommonTypes';
import {
    baseballScoreBoardAutomaticSchema,
    baseballScoreBoardSchema,
    scoreBoardSchema,
    scoreOverviewSchema,
} from './scoreBoardSchema';

export const wsResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
});
export type TWSResponse = z.infer<typeof wsResponseSchema>;

//   ----------------------------------------
//                   Services
//   ----------------------------------------

export const servicesSchema = z.discriminatedUnion('name', [
    infoTickerSchema,
    accuweatherSchema,
    ptzCompassSchema,
    imagesSchema,
    ptzSchema,
    pipSchema,
    customGraphicsSchema,
    screenSharingSchema,
    webCameraSharingSchema,
    scoreBoardSchema,
    baseballScoreBoardSchema,
    baseballScoreBoardAutomaticSchema,
    scoreOverviewSchema,
]);
export type TService = z.infer<typeof servicesSchema>;

export const serviceListSchema = z.object({
    services: z.array(servicesSchema),
});
export type TServiceList = z.infer<typeof serviceListSchema>;

export type TAccuweather = z.infer<typeof accuweatherSchema>;
export const isAccuweather = (service: TService): service is TAccuweather => service.name === 'accuweather';

export type TCustomGraphics = z.infer<typeof customGraphicsSchema>;
export const isCustomGraphics = (service: TService): service is TCustomGraphics => service.name === 'customGraphics';

export type TImages = z.infer<typeof imagesSchema>;
export const isImages = (service: TService): service is TImages => service.name === 'images';

export type TInfoticker = z.infer<typeof infoTickerSchema>;
export const isInfoticker = (service: TService): service is TInfoticker => service.name === 'infoticker';

export type TPip = z.infer<typeof pipSchema>;
export const isPip = (service: TService): service is TPip => service.name === 'pip';

export type TPtzCompass = z.infer<typeof ptzCompassSchema>;
export const isPtzCompass = (service: TService): service is TPtzCompass => service.name === 'ptzCompass';

export type TPtz = z.infer<typeof ptzSchema>;
export const isPtz = (service: TService): service is TPtz => service.name === 'ptz';

export type TScreenSharing = z.infer<typeof screenSharingSchema>;
export const isScreenSharing = (service: TService): service is TScreenSharing => service.name === 'screenSharing';

export type TWebCameraSharing = z.infer<typeof webCameraSharingSchema>;
export const isWebCameraSharing = (service: TService): service is TWebCameraSharing => service.name === 'web_camera';

export type TScoreBoard = z.infer<typeof scoreBoardSchema>;
export const isScoreBoard = (service: TService): service is TScoreBoard => service.name === 'scoreBoard';

export type TBaseballScoreBoard = z.infer<typeof baseballScoreBoardSchema>;
export const isBaseballScoreBoard = (service: TService): service is TBaseballScoreBoard =>
    service.name === 'baseballScoreBoard';

export type TBaseballScoreBoardAutomatic = z.infer<typeof baseballScoreBoardAutomaticSchema>;
export const isBaseballScoreBoardAutomatic = (service: TService): service is TBaseballScoreBoardAutomatic =>
    service.name === 'myBallBaseballWidgets';

export type TScoreOverview = z.infer<typeof scoreOverviewSchema>;
export const isScoreOverview = (service: TService): service is TScoreOverview => service.name === 'scoreOverview';

//   ----------------------------------------
//               Storage & Files
//   ----------------------------------------

export type TFileType = 'image' | 'font';
export enum ImageType {
    PNG,
    JPEG,
}

export const imageFileStorageTypeSchema = z.union([
    z.literal('flash'),
    z.literal('SD0'),
    z.literal('ftp'),
    z.literal('samba'),
    z.literal('url'),
]);
export const fontFileStorageTypeSchema = z.union([z.literal('flash'), z.literal('SD0')]);

export type TImageFileStorageType = z.infer<typeof imageFileStorageTypeSchema>;
export type TFontFileStorageType = z.infer<typeof fontFileStorageTypeSchema>;
export type TFileStorageType<T extends TFileType> = T extends 'image' ? TImageFileStorageType : TFontFileStorageType;

export const imageFilestorageDataListSchema = z.array(
    z.object({
        type: imageFileStorageTypeSchema,
        state: z.string(),
    })
);
export const fontStorageDataListSchema = z.array(
    z.object({
        type: fontFileStorageTypeSchema,
        state: z.string(),
    })
);
export const getStorageDataListSchema = (fileType: TFileType) => {
    return fileType === 'image' ? imageFilestorageDataListSchema : fontStorageDataListSchema;
};

export type TImageStorageDataList = z.infer<typeof imageFilestorageDataListSchema>;
export type TFontStorageDataList = z.infer<typeof fontStorageDataListSchema>;
export type TStorageDataList<T extends TFileType> = T extends 'image' ? TImageStorageDataList : TFontStorageDataList;

export const imageStorageResponseSchema = z.object({
    code: z.number(),
    list: imageFilestorageDataListSchema,
});
export const fontStorageResponseSchema = z.object({
    code: z.number(),
    list: fontStorageDataListSchema,
});
export const getStorageResponseSchema = (fileType: TFileType) => {
    return fileType === 'image' ? imageStorageResponseSchema : fontStorageResponseSchema;
};

export type TImageStorageResponse = z.infer<typeof imageStorageResponseSchema>;
export type TFontStorageResponse = z.infer<typeof fontStorageResponseSchema>;
export type TStorageResponse<T extends TFileType> = T extends 'image' ? TImageStorageResponse : TFontStorageResponse;

export const imageFileSchema = z.object({
    name: z.string(),
    path: z.string().url(),
    storage: imageFileStorageTypeSchema,
});
export const fontFileSchema = z.object({
    name: z.string(),
    path: z.string().url(),
    storage: fontFileStorageTypeSchema,
});
export const getFileSchema = (fileType: TFileType) => {
    return fileType === 'image' ? imageFileSchema : fontFileSchema;
};
export type TImageFile = z.infer<typeof imageFileSchema>;
export type TFontFile = z.infer<typeof fontFileSchema>;
export type TFile<T extends TFileType> = T extends 'image' ? TImageFile : TFontFile;

export const imageFileListSchema = z.array(imageFileSchema);
export const fontFileListSchema = z.array(fontFileSchema);
export const getFileListSchema = (fileType: TFileType) => {
    return fileType === 'image' ? imageFileListSchema : fontFileListSchema;
};
export type TImageFileList = z.infer<typeof imageFileListSchema>;
export type TFontFileList = z.infer<typeof fontFileListSchema>;
export type TFileList<T extends TFileType> = T extends 'image' ? TImageFileList : TFontFileList;

export const imageFileDataSchema = z.object({
    code: z.number(),
    list: imageFileListSchema,
});
export const fontFileDataSchema = z.object({
    code: z.number(),
    list: fontFileListSchema,
});
export const getFileDataSchema = (fileType: TFileType) => {
    return fileType === 'image' ? imageFileDataSchema : fontFileDataSchema;
};
export type TImageFileData = z.infer<typeof imageFileDataSchema>;
export type TFontFileData = z.infer<typeof fontFileDataSchema>;
export type TFileData<T extends TFileType> = T extends 'image' ? TImageFileData : TFontFileData;

export type TOverlayListItem = z.infer<typeof overlaySchema>;
