import { cameraSettingsSchema } from './PlaneTrackerAPI';

import { describe, test, expect } from '@jest/globals';

const AIRCRAFT_LABEL = {
    firstRow: 'icao',
    secondRow: 'call_sign',
    thirdRow: 'blank',
    fourthRow: 'registration',
    opacity: 50,
} as const;

const DEFAULT_DRONE_LABEL = { firstRow: 'remote_id', opacity: 30 };

describe('cameraSettingsSchema identificationLabel', () => {
    test('defaults both aircraft and drone labels', () => {
        expect(cameraSettingsSchema.parse({}).identificationLabel).toEqual({
            aircraft: {
                firstRow: 'icao',
                secondRow: 'call_sign',
                thirdRow: 'blank',
                fourthRow: 'blank',
                opacity: 30,
            },
            drone: DEFAULT_DRONE_LABEL,
        });
    });

    test('parses the aircraft and drone label', () => {
        const identificationLabel = { aircraft: AIRCRAFT_LABEL, drone: { firstRow: 'blank', opacity: 70 } };

        expect(cameraSettingsSchema.parse({ identificationLabel }).identificationLabel).toEqual(identificationLabel);
    });

    test('defaults a missing drone label', () => {
        expect(
            cameraSettingsSchema.parse({ identificationLabel: { aircraft: AIRCRAFT_LABEL } }).identificationLabel
        ).toEqual({ aircraft: AIRCRAFT_LABEL, drone: DEFAULT_DRONE_LABEL });
    });

    test('converts the legacy flat label to the aircraft label', () => {
        expect(cameraSettingsSchema.parse({ identificationLabel: AIRCRAFT_LABEL }).identificationLabel).toEqual({
            aircraft: AIRCRAFT_LABEL,
            drone: DEFAULT_DRONE_LABEL,
        });
    });

    test('returns an independent drone label for each legacy parse', () => {
        const first = cameraSettingsSchema.parse({ identificationLabel: AIRCRAFT_LABEL });
        first.identificationLabel.drone.opacity = 90;

        const second = cameraSettingsSchema.parse({ identificationLabel: AIRCRAFT_LABEL });
        expect(second.identificationLabel.drone).toEqual(DEFAULT_DRONE_LABEL);
    });

    test('rejects an unknown drone label row', () => {
        const identificationLabel = { aircraft: AIRCRAFT_LABEL, drone: { firstRow: 'icao', opacity: 30 } };

        expect(cameraSettingsSchema.safeParse({ identificationLabel }).success).toBe(false);
    });
});

const CAPTURE_CONFIG = { defaultCaptureSizeMeters: 50, captureSizeExtensionMeters: 20 };
const DEFAULT_CAPTURE_CONFIG = { defaultCaptureSizeMeters: 120, captureSizeExtensionMeters: 80 };

describe('cameraSettingsSchema cameraConfig', () => {
    test('defaults both aircraft and drone capture config', () => {
        expect(cameraSettingsSchema.parse({}).cameraConfig).toEqual({
            aircraft: DEFAULT_CAPTURE_CONFIG,
            drone: DEFAULT_CAPTURE_CONFIG,
        });
    });

    test('parses independent aircraft and drone capture config', () => {
        const cameraConfig = {
            aircraft: CAPTURE_CONFIG,
            drone: { defaultCaptureSizeMeters: 5, captureSizeExtensionMeters: 3 },
        };

        expect(cameraSettingsSchema.parse({ cameraConfig }).cameraConfig).toEqual(cameraConfig);
    });

    test('defaults a missing drone capture config', () => {
        expect(cameraSettingsSchema.parse({ cameraConfig: { aircraft: CAPTURE_CONFIG } }).cameraConfig).toEqual({
            aircraft: CAPTURE_CONFIG,
            drone: DEFAULT_CAPTURE_CONFIG,
        });
    });

    test('copies the legacy flat capture config to both aircraft and drone', () => {
        expect(cameraSettingsSchema.parse({ cameraConfig: CAPTURE_CONFIG }).cameraConfig).toEqual({
            aircraft: CAPTURE_CONFIG,
            drone: CAPTURE_CONFIG,
        });
    });

    test('returns independent aircraft and drone objects', () => {
        const legacy = cameraSettingsSchema.parse({ cameraConfig: CAPTURE_CONFIG }).cameraConfig;
        legacy.drone.defaultCaptureSizeMeters = 1;
        expect(legacy.aircraft).toEqual(CAPTURE_CONFIG);

        const first = cameraSettingsSchema.parse({}).cameraConfig;
        first.drone.defaultCaptureSizeMeters = 1;
        expect(cameraSettingsSchema.parse({}).cameraConfig.drone).toEqual(DEFAULT_CAPTURE_CONFIG);
    });

    test('rejects a non-positive drone capture size', () => {
        const cameraConfig = { aircraft: CAPTURE_CONFIG, drone: { ...CAPTURE_CONFIG, defaultCaptureSizeMeters: 0 } };

        expect(cameraSettingsSchema.safeParse({ cameraConfig }).success).toBe(false);
    });
});
