import { z } from 'zod';
import { trackingModeSchema, zonesSchema } from '../PlaneTrackerAPI';

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
    emitterCategorySet: z.number().default(4),
    emitterCategory: z.number().default(3),
    emergencyState: z.boolean(),
    emergencyStatusMessage: z.string(),
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

export const planeTrackerUserActionData = z.discriminatedUnion('cgi', [
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.TRACK_ICAO),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            icao: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.RESET_ICAO),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.SET_PRIORITY_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: z.object({
            priorityList: z.array(z.string()), // ICAO[]
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.SET_BLACK_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: z.object({
            blackList: z.array(z.string()), // ICAO[]
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.SET_WHITE_LIST),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: z.object({
            whiteList: z.array(z.string()), // ICAO[]
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.GO_TO_COORDINATES),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            lat: z.string(),
            lon: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.SET_TRACKING_MODE),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: trackingModeSchema,
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.SET_ZONES),
        ip: z.string(),
        params: apiStringUserSchema,
        postJsonBody: zonesSchema,
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.RESET_PTZ_CALIBRATION),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.LOCK_API),
        ip: z.string(),
        params: apiStringUserSchema.extend({
            timeout: z.string(),
        }),
    }),
    z.object({
        cgi: z.literal(PlaneTrackerUserActions.UNLOCK_API),
        ip: z.string(),
        params: apiStringUserSchema,
    }),
]);

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
        params: apiStringUserSchema.extend({
            lat: z.string().optional(),
            lon: z.string().optional(),
            timeout: z.string().optional(),
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
export type TPlaneTrackerStringApiUser = z.infer<typeof apiStringUserSchema>;

export type TPlaneTrackerUserActionData = z.infer<typeof planeTrackerUserActionData>;
export type TPlaneTrackerUserActionDataOfCgi<T extends PlaneTrackerUserActions> = Extract<
    TPlaneTrackerUserActionData,
    { cgi: T }
>;
