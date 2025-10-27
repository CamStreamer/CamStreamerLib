import { z } from 'zod';

const apiFlightDataSchema = z.object({
    icao: z.string(),
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
    emergencyState: z.boolean(),
    emergencyStatusMessage: z.string(), // Emergency description
});

const apiUserSchema = z.object({
    userId: z.string(),
    userName: z.string(),
    userPriority: z.number(),
    ip: z.string(),
});

export enum PlaneTrackerWsEvents {
    FLIGHT_LIST = 'FLIGHT_LIST',
    CAMERA_POSITION = 'CAMERA_POSITION',
    TRACKING_START = 'TRACKING_START',
    TRACKING_STOP = 'TRACKING_STOP',
    USER_ACTION = 'USER_ACTION',
    CONNECTED_USERS = 'CONNECTED_USERS',
    FORCE_TRACKING_STATUS = 'FORCE_TRACKING_STATUS',
}

export enum PlaneTrackerUserActions {
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

const ptrEventsDataSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('CAMERA_POSITION'),
        lat: z.number(),
        lon: z.number(),
        azimuth: z.number().min(0).max(360),
        elevation: z.number().min(-90).max(90),
        fov: z.number(),
    }),
    z.object({
        type: z.literal('TRACKING_START'),
        icao: z.string(),
    }),
    z.object({
        type: z.literal('TRACKING_STOP'),
    }),
    z.object({
        type: z.literal('FLIGHT_LIST'),
        list: z.array(apiFlightDataSchema),
    }),
    z.object({
        type: z.literal('USER_ACTION'),
        ip: z.string(),
        params: z.object({
            userId: z.string(),
            userName: z.string(),
            userPriority: z.string(),
        }),
        cgi: z.enum([
            PlaneTrackerUserActions.TRACK_ICAO,
            PlaneTrackerUserActions.RESET_ICAO,
            PlaneTrackerUserActions.SET_PRIORITY_LIST,
            PlaneTrackerUserActions.SET_BLACK_LIST,
            PlaneTrackerUserActions.SET_WHITE_LIST,
            PlaneTrackerUserActions.GO_TO_COORDINATES,
            PlaneTrackerUserActions.SET_TRACKING_MODE,
            PlaneTrackerUserActions.SET_ZONES,
            PlaneTrackerUserActions.RESET_PTZ_CALIBRATION,
            PlaneTrackerUserActions.LOCK_API,
            PlaneTrackerUserActions.UNLOCK_API,
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
    z.object({ type: z.literal('init'), data: ptrEventsDataSchema }),
    ...ptrEventsDataSchema.options,
]);

export type TPlaneTrackerEvent = z.infer<typeof ptrEventsDataSchema>;
export type TPlaneTrackerEventType = TPlaneTrackerEvent['type'];
export type TPlaneTrackerEventOfType<T extends TPlaneTrackerEventType> = Extract<TPlaneTrackerEvent, { type: T }>;

export type TPlaneTrackerApiFlightData = z.infer<typeof apiFlightDataSchema>;
export type TPlaneTrackerApiUser = z.infer<typeof apiUserSchema>;
