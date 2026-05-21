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
    groupId: z.string().optional(),
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

const userSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userPriority: z.string(),
});
const apiUserSchema = userSchema.extend({
    ip: z.string(),
    userPriority: z.number(),
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

const eventsDataSchema = z.union([
    z.object({ type: z.literal('CAMERA_POSITION') }).merge(wsCameraPositionDataSchema),
    z.object({
        type: z.literal('TRACKING_START'),
        icao: z.string(),
        targetId: z.string(),
        domain: domainIdSchema,
        categoryId: z.string(),
    }),
    z.object({ type: z.literal('TRACKING_STOP') }),
    z.object({ type: z.literal('FLIGHT_LIST'), list: z.array(wsApiFlightDataSchema) }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.TRACK_ICAO),
        ip: z.string(),
        params: userSchema.extend({ icao: z.string() }),
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.RESET_ICAO),
        ip: z.string(),
        params: userSchema,
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.SET_PRIORITY_LIST),
        ip: z.string(),
        params: userSchema,
        postJsonBody: priorityListSchema,
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.SET_BLACK_LIST),
        ip: z.string(),
        params: userSchema,
        postJsonBody: blackListSchema,
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.SET_WHITE_LIST),
        ip: z.string(),
        params: userSchema,
        postJsonBody: whiteListSchema,
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.GO_TO_COORDINATES),
        ip: z.string(),
        params: userSchema.extend({ lat: z.string(), lon: z.string() }),
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.SET_TRACKING_MODE),
        ip: z.string(),
        params: userSchema,
        postJsonBody: trackingModeSchema,
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.SET_ZONES),
        ip: z.string(),
        params: userSchema,
        postJsonBody: zonesSchema,
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.RESET_PTZ_CALIBRATION),
        ip: z.string(),
        params: userSchema,
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.LOCK_API),
        ip: z.string(),
        params: userSchema.extend({ timeout: z.string() }),
        postJsonBody: z.any(),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        cgi: z.literal(EUserActions.UNLOCK_API),
        ip: z.string(),
        params: userSchema,
        postJsonBody: z.any(),
    }),
    z.object({ type: z.literal('CONNECTED_USERS'), users: z.array(apiUserSchema) }),
    z.object({
        type: z.literal('FORCE_TRACKING_STATUS'),
        enabled: z.boolean(),
        icao: z.string().optional(),
        targetId: z.string().optional(),
    }),
    z.object({ type: z.literal('API_LOCK_STATUS'), isLocked: z.boolean(), user: apiUserSchema.optional() }),
] as const);

export const ptrEventsSchema = z.union([
    z.object({ type: z.literal('init'), data: eventsDataSchema }),
    ...eventsDataSchema.options,
] as const);

export type TEventData = z.infer<typeof eventsDataSchema>;
export type TWsUserActionData = Extract<TEventData, { type: 'USER_ACTION' }>;
export type TUserActionDataOfCgi<T extends EUserActions> = Extract<TWsUserActionData, { cgi: T }>;

export type TWsApiFlightData = z.infer<typeof wsApiFlightDataSchema>;
export type TWsApiCameraData = z.infer<typeof wsCameraPositionDataSchema>;
export type TApiUser = z.infer<typeof apiUserSchema>;
