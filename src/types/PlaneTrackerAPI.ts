import { z } from 'zod';

export type TImportDataType = 'MAP_DATA' | 'SERVER_DATA' | 'ALL';
export type TExportDataType = 'NIGHT_SKY_CALIBRATION_DATA' | 'ALL';

export type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
};

export const wsAliasResponseSchema = z.object({
    alias: z.string(),
    ws: z.string(),
    ws_initial_message: z.string(),
});

//   ----------------------------------------
//                 Settings
//   ----------------------------------------

export const connectionSchema = z.object({
    protocol: z.union([z.literal('http'), z.literal('https'), z.literal('https_insecure')]),
    ip: z.union([z.string().ip(), z.literal('')]),
    port: z.number().positive().lt(65535),
    user: z.string(),
    pass: z.string(),
});

export const widgetSchema = z.object({
    enabled: z.boolean().default(true),
    coord: z.union([
        z.literal('top_left'),
        z.literal('top_right'),
        z.literal('bottom_left'),
        z.literal('bottom_right'),
    ]),
    posX: z.number().nonnegative(),
    posY: z.number().nonnegative(),
    scale: z.number().positive(),
});

const labelOptionsSchema = z.union([
    z.literal('blank'),
    z.literal('registration'),
    z.literal('call_sign'),
    z.literal('flight_number'),
    z.literal('icao'),
]);
export type TLabelOption = z.infer<typeof labelOptionsSchema>;

const identificationLabelSchema = z.object({
    firstRow: labelOptionsSchema,
    secondRow: labelOptionsSchema,
    thirdRow: labelOptionsSchema,
    fourthRow: labelOptionsSchema,
    opacity: z.number().positive(),
});

export const cameraSettingsSchema = z.object({
    units: z.union([z.literal('metric'), z.literal('imperial')]).default('imperial'),
    adsbSource: z
        .object({
            ip: z.union([z.string().ip(), z.literal('')]),
            port: z.number().positive().lt(65535),
        })
        .default({ ip: '', port: 30334 }),
    camera: connectionSchema.default({
        protocol: 'http',
        ip: '127.0.0.1',
        port: 80,
        user: 'root',
        pass: '',
    }),
    cameraCalibrationProcessConfig: z
        .object({
            nightSkyCalibrationEnabled: z.boolean(),
            scheduleNightSkyCalibrationTimestamp: z.number(), // Unixtime ms precision
        })
        .default({ nightSkyCalibrationEnabled: false, scheduleNightSkyCalibrationTimestamp: 0 }),
    cameraConfig: z
        .object({
            maxZoomLevel: z.number().optional(),
            defaultCaptureSizeMeters: z.number().positive().default(120),
            captureSizeExtensionMeters: z.number().positive().default(80),
        })
        .default({
            maxZoomLevel: 30,
            defaultCaptureSizeMeters: 120,
            captureSizeExtensionMeters: 80,
        }),
    stream: z
        .object({
            width: z.number().positive(),
            height: z.number().positive(),
        })
        .default({ width: 1920, height: 1080 }),
    imageConfig: z
        .object({
            dayAperture: z.number().nonnegative().min(0).max(100),
            nightAperture: z.number().nonnegative().min(0).max(100),
        })
        .default({ dayAperture: 50, nightAperture: 0 }),
    airportConfig: z
        .object({
            icao: z.string().default(''),
            centerLat: z.number(),
            centerLon: z.number(),
            radius: z.number().nonnegative().default(10000), // Radius in meters around the airport
        })
        .default({
            icao: '',
            centerLat: 0,
            centerLon: 0,
            radius: 10000,
        }),
    trackingConfig: z
        .object({
            prioritizeEmergency: z.boolean(),
            guardTourEnabled: z.boolean().default(false),
            guardTourId: z.number().int().nonnegative().default(0),
        })
        .default({ prioritizeEmergency: true, guardTourEnabled: false, guardTourId: 0 }),

    overlayText: z
        .object({
            displayIcao: z.boolean().optional(),
            displayRegistration: z.boolean().optional(),
            displayFlightNumber: z.boolean().optional(),
            displayAltitude: z.boolean().optional(),
            displayVelocity: z.boolean().optional(),
            displayDistance: z.boolean().optional(),
            displayFOV: z.boolean().optional(),
            displayPTError: z.boolean().optional(),
            displayPTZSpeed: z.boolean().optional(),
            displayVelocityData: z.boolean().optional(),
            displaySignalQuality: z.boolean().optional(),
            displayAutoTrackingInfo: z.boolean().optional(),
            displayGPSCoords: z.boolean().optional(),
            displayVapixQuery: z.boolean().optional(),
            displayFocus: z.boolean().optional(),
            displayAperture: z.boolean().optional(),
            displaySunDistance: z.boolean().optional(),
            displayTickTime: z.boolean().optional(),
            displayAircraftInfo: z.boolean().optional(),
        })
        .optional(),
    widget: widgetSchema.default({
        enabled: true,
        coord: 'top_right',
        posX: 10,
        posY: 10,
        scale: 100,
    }),
    airportWidget: widgetSchema.default({
        enabled: true,
        coord: 'top_left',
        posX: 10,
        posY: 10,
        scale: 100,
    }),
    fr24FlightInfoSource: z
        .object({
            enabled: z.boolean().default(false),
            priority: z.number().int().positive().default(1),
            apiToken: z.string().default(''),
            validateFlights: z.boolean().default(true),
        })
        .default({
            enabled: false,
            priority: 1,
            apiToken: '',
            validateFlights: true,
        }),
    radarcapeFlightInfoSource: z
        .object({
            enabled: z.boolean().default(false),
            priority: z.number().int().positive().default(2),
            ip: z.union([z.string().ip(), z.literal('')]).default(''),
            port: z.number().positive().lt(65535).default(80),
        })
        .default({
            enabled: false,
            priority: 2,
            ip: '',
            port: 80,
        }),
    identificationLabel: identificationLabelSchema.default({
        firstRow: 'registration',
        secondRow: 'blank',
        thirdRow: 'blank',
        fourthRow: 'blank',
        opacity: 30,
    }),
    acs: connectionSchema
        .extend({
            enabled: z.boolean(),
            sourceKey: z.string(),
        })
        .default({
            enabled: false,
            protocol: 'https_insecure',
            ip: '',
            port: 29204,
            user: '',
            pass: '',
            sourceKey: '',
        }),
    genetec: connectionSchema
        .extend({
            enabled: z.boolean(),
            baseUri: z.string().default(''),
            appId: z.string().default(''),
            cameraList: z.string().array().default([]),
        })
        .default({
            enabled: false,
            protocol: 'http',
            ip: '',
            port: 4590,
            user: '',
            pass: '',
            baseUri: 'WebSdk',
            appId: '',
            cameraList: [],
        }),
});
export type TCameraSettings = z.infer<typeof cameraSettingsSchema>;

export const serverSettingsSchema = z.object({
    cameraCalibration: z.object({
        posLat: z.number(),
        posLon: z.number(),
        geoidHN: z.number(),
        altitudeAmsl: z.number(),
        rotationEast: z.number(),
        rotationNorth: z.number(),
        rotationUp: z.number(),
        tiltTransformationCoefA: z.number(),
        tiltCameraKnownPoint: z.number(),
        tiltRealKnownPoint: z.number(),
    }),
});
export type TServerSettings = z.infer<typeof serverSettingsSchema>;

//   ----------------------------------------
//             Planes & Tracking
//   ----------------------------------------

export type ICAO = string;

export const trackingModeSchema = z.object({
    mode: z.union([z.literal('MANUAL'), z.literal('AUTOMATIC')]),
});
export type TTrackingMode = z.infer<typeof trackingModeSchema>;

export const flightInfoSchema = z.object({
    callsign: z.string().optional(),
    flightNumber: z.string().optional(),
    registration: z.string().optional(),
    aircraftType: z.string().optional(),
    airlines: z.string().optional(),
    originAirport: z
        .object({
            icao: z.string().optional(),
            iata: z.string().optional(),
            city: z.string().optional(),
        })
        .optional(),
    destinationAirport: z.object({
        icao: z.string().optional(),
        iata: z.string().optional(),
        city: z.string().optional(),
    }),
    flightImages: z
        .array(
            z.object({
                src: z.string().optional(),
                photographer: z.string().optional(),
            })
        )
        .optional(),
});
export type TFlightInfo = z.infer<typeof flightInfoSchema>;

//   ----------------------------------------
//                    Lists
//   ----------------------------------------

export const priorityListSchema = z.object({
    priorityList: z.array(z.string()).default([]),
});
export type TPriorityList = z.infer<typeof priorityListSchema>;

export const whiteListSchema = z.object({
    whiteList: z.array(z.string()).default([]),
});
export type TWhiteList = z.infer<typeof whiteListSchema>;

export const blackListSchema = z.object({
    blackList: z.array(z.string()).default([]),
});
export type TBlackList = z.infer<typeof blackListSchema>;

//   ----------------------------------------
//                 Map & Zones
//   ----------------------------------------

export const mapTypeSchema = z.enum(['roadmap', 'satellite']);
export type TMapType = z.infer<typeof mapTypeSchema>;

export const mapInfoSchema = z.object({
    minZoom: z.number().nonnegative(),
    maxZoom: z.number().nonnegative(),
    mapTypes: z.array(mapTypeSchema),
    tileSize: z.number().nonnegative(),
});
export type TMapInfo = z.infer<typeof mapInfoSchema>;

export const zonesSchema = z.object({
    zones: z
        .array(
            z.object({
                enabled: z.boolean().default(true),
                name: z.string().optional(),
                area: z
                    .array(
                        z.object({
                            lat: z.number(),
                            lon: z.number(),
                        })
                    )
                    .nonempty(),
                minAltitudeAmsl: z.number().optional(),
                maxAltitudeAmsl: z.number().optional(),
                minSpeedKmph: z.number().optional(),
                maxSpeedKmph: z.number().optional(),
                weight: z.number(),
            })
        )
        .default([]),
});
export type TZones = z.infer<typeof zonesSchema>;
