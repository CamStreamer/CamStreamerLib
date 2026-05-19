import { z } from 'zod';
import {
    blackListSchema,
    priorityListSchema,
    trackingModeSchema,
    whiteListSchema,
    zonesSchema,
    domainIdSchema,
} from '../PlaneTrackerAPI';

const wsApiFlightDataSchema = z.object({
    targetId: z.string(),
    icao: z.string(), // for backward compatibility
    domain: domainIdSchema,
    categoryId: z.string(),
    groupId: z.string(),
    lat: z.number(),
    lon: z.number(),
    heading: z.number(),
    groundSpeed: z.number(), // [km/h]
    altitudeAMSL: z.number(), // [m]
    cameraDistance: z.number(), // [m]
    autoTrackingOrder: z.number(),
    whiteListed: z.boolean(),
    blackListed: z.boolean(),
    priorityListed: z.boolean(),
    autoSelectionIgnored: z.boolean(),
    signalQuality: z.number(),
    emitterCategorySet: z.number().default(4),
    emitterCategory: z.number().default(3),
    emergencyState: z.boolean(),
    emergencyStatusMessage: z.string(),
});

const wsCameraPositionDataSchema = z.object({
    lat: z.number(),
    lon: z.number(),
    azimuth: z.number().min(0).max(360),
    elevation: z.number().min(-90).max(90),
    fov: z.number(),
});

const apiUserSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userPriority: z.number(),
    ip: z.string(),
});
const apiStringUserSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userPriority: z.string(),
});

export type TEventType =
    | 'CAMERA_POSITION'
    | 'TRACKING_START'
    | 'TRACKING_STOP'
    | 'FLIGHT_LIST'
    | 'USER_ACTION'
    | 'CONNECTED_USERS'
    | 'FORCE_TRACKING_STATUS'
    | 'API_LOCK_STATUS';

export enum EUserActions {
    TRACK_ICAO = 'trackIcao.cgi',
    RESET_ICAO = 'resetIcao.cgi',
    SET_PRIORITY_LIST = 'setPriorityList.cgi',
    SET_BLACK_LIST = 'setBlackList.cgi',
    SET_WHITE_LIST = 'setWhiteList.cgi',
    GO_TO_COORDINATES = 'goToCoordinates.cgi',
    SET_TRACKING_MODE = 'setTrackingMode.cgi',
    SET_ZONES = 'setZones.cgi',
    RESET_PTZ_CALIBRATION = 'resetPtzCalibration.cgi',
    LOCK_API = 'lockApi.cgi',
    UNLOCK_API = 'unlockApi.cgi',
}

export const wsUserActionData = z.discriminatedUnion('cgi', [
    z.object({
        cgi: z.literal(EUserActions.TRACK_ICAO),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            icao: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(EUserActions.RESET_ICAO),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.SET_PRIORITY_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: priorityListSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.SET_BLACK_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: blackListSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.SET_WHITE_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: whiteListSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.GO_TO_COORDINATES),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            lat: z.string(),
            lon: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(EUserActions.SET_TRACKING_MODE),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: trackingModeSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.SET_ZONES),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: zonesSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.RESET_PTZ_CALIBRATION),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
    z.object({
        cgi: z.literal(EUserActions.LOCK_API),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            timeout: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(EUserActions.UNLOCK_API),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
]);
export type TWsUserActionData = z.infer<typeof wsUserActionData>;

const eventsDataSchema = z.discriminatedUnion('type', [
    z
        .object({
            type: z.literal('CAMERA_POSITION'),
        })
        .merge(wsCameraPositionDataSchema),
    z.object({
        type: z.literal('TRACKING_START'),
        icao: z.string(),
    }),
    z.object({
        type: z.literal('TRACKING_STOP'),
    }),
    z.object({
        type: z.literal('FLIGHT_LIST'),
        list: z.array(wsApiFlightDataSchema),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            lat: z.string().optional(),
            lon: z.string().optional(),
            timeout: z.string().optional(),
        }),
        cgi: z.enum([
            EUserActions.TRACK_ICAO,
            EUserActions.RESET_ICAO,
            EUserActions.SET_PRIORITY_LIST,
            EUserActions.SET_BLACK_LIST,
            EUserActions.SET_WHITE_LIST,
            EUserActions.GO_TO_COORDINATES,
            EUserActions.SET_TRACKING_MODE,
            EUserActions.SET_ZONES,
            EUserActions.RESET_PTZ_CALIBRATION,
            EUserActions.LOCK_API,
            EUserActions.UNLOCK_API,
        ]),
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('CONNECTED_USERS'),
        users: z.array(apiUserSchema),
    }),
    z.object({
        type: z.literal('FORCE_TRACKING_STATUS'),
        enabled: z.boolean(),
        icao: z.string().optional(),
    }),
    z.object({
        type: z.literal('API_LOCK_STATUS'),
        isLocked: z.boolean(),
        user: apiUserSchema.optional(),
    }),
]);

export const ptrEventsSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('init'), data: eventsDataSchema }),
    ...eventsDataSchema.options,
]);

export type TEventData = z.infer<typeof eventsDataSchema>;

export type TWsApiFlightData = z.infer<typeof wsApiFlightDataSchema>;
export type TWsApiCameraData = z.infer<typeof wsCameraPositionDataSchema>;

export type TApiUser = z.infer<typeof apiUserSchema>;
export type TStringApiUser = z.infer<typeof apiStringUserSchema>;

export type TUserActionData = z.infer<typeof wsUserActionData>;
export type TUserActionDataOfCgi<T extends EUserActions> = Extract<TUserActionData, { cgi: T }>;
