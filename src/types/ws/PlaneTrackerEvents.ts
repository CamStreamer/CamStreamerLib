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
            userPriority: z.number(),
        }),
        cgi: z.string(),
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
