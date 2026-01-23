import { z } from 'zod';

export const serviceNames = {
    accuweather: 'accuweather',
    infoticker: 'infoticker',
    customGraphics: 'customGraphics',
    ptzCompass: 'ptzCompass',
    images: 'images',
    ptz: 'ptz',
    pip: 'pip',
    screenSharing: 'screenSharing',
    web_camera: 'web_camera',
    scoreBoard: 'scoreBoard',
    baseballScoreBoard: 'baseballScoreBoard',
    myBallBaseballWidgets: 'myBallBaseballWidgets',
    scoreOverview: 'scoreOverview',
    htmlOverlay: 'htmlOverlay',
} as const;

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

export const serviceCommonSchema = z.object({
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
    customName: z.string().default(''),
    zIndex: z.number().optional(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
});

export const sharingSchema = serviceCommonSchema.extend({
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
