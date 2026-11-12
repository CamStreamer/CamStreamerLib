import { stripPosixDst } from './posixTimeZone';

import { describe, test, expect } from '@jest/globals';

describe('posixTimeZone', () => {
    describe('stripPosixDst', () => {
        test.each([
            { name: 'Sydney', input: 'EST-10EST,M10.1.0,M4.1.0/3', expected: 'EST-10' },
            { name: 'Honolulu', input: 'HAST10HADT,M3.2.0,M11.1.0', expected: 'HAST10' },
            { name: 'Denver', input: 'MST7MDT,M3.2.0,M11.1.0', expected: 'MST7' },
            { name: 'bracketed names', input: '<+10>-10<+11>,M10.1.0,M4.1.0/3', expected: '<+10>-10' },
            { name: 'half-hour offset', input: 'CST-9:30CST,M10.1.0,M4.1.0/3', expected: 'CST-9:30' },
        ])('removes the DST part for $name', ({ input, expected }) => {
            expect(stripPosixDst(input)).toBe(expected);
        });

        test.each(['EST-10', 'HAST10', '<+10>-10', 'CST-9:30', 'UTC0'])(
            'keeps DST-free input %s unchanged',
            (input) => {
                expect(stripPosixDst(input)).toBe(input);
            }
        );

        test('returns unparseable input unchanged', () => {
            expect(stripPosixDst('garbage')).toBe('garbage');
        });
    });
});
