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
import { overlaySchema } from './widgetCommonTypes';
import {
    baseballScoreBoardAutomaticSchema,
    baseballScoreBoardSchema,
    scoreBoardSchema,
    scoreOverviewSchema,
} from './scoreBoardSchema';

export const WSResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
});
export type TWSResponse = z.infer<typeof WSResponseSchema>;

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
export const isScoreBoard = (widget: TWidget): widget is TScoreBoard => widget.name === 'scoreBoard';

export type TBaseballScoreBoard = z.infer<typeof baseballScoreBoardSchema>;
export const isBaseballScoreBoard = (widget: TWidget): widget is TBaseballScoreBoard =>
    widget.name === 'baseballScoreBoard';

export type TBaseballScoreBoardAutomatic = z.infer<typeof baseballScoreBoardAutomaticSchema>;
export const isBaseballScoreBoardAutomatic = (widget: TWidget): widget is TBaseballScoreBoardAutomatic =>
    widget.name === 'myBallBaseballWidgets';

export type TScoreOverview = z.infer<typeof scoreOverviewSchema>;
export const isScoreOverview = (widget: TWidget): widget is TScoreOverview => widget.name === 'scoreOverview';

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

export type TOverlayListItem = z.infer<typeof overlaySchema>;
