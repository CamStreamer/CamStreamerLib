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
                firstRow: 'registration',
                secondRow: 'blank',
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
