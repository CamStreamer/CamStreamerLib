import { toCamelCase, toCamelCaseDeep, toSnakeCase, toSnakeCaseDeep } from './transformers';

import { describe, test, expect } from '@jest/globals';

describe('transformers', () => {
    describe('toCamelCase', () => {
        test('converts snake_case keys to camelCase', () => {
            expect(toCamelCase({ foo_bar: 1, baz_qux_quux: 2 })).toEqual({ fooBar: 1, bazQuxQuux: 2 });
        });

        test('converts kebab-case keys to camelCase', () => {
            expect(toCamelCase({ 'foo-bar': 1, 'baz-qux': 2 })).toEqual({ fooBar: 1, bazQux: 2 });
        });

        test('preserves already-camelCase keys', () => {
            expect(toCamelCase({ fooBar: 1 })).toEqual({ fooBar: 1 });
        });

        test('converts PascalCase keys to camelCase', () => {
            expect(toCamelCase({ FooBar: 1 })).toEqual({ fooBar: 1 });
        });

        test('handles consecutive uppercase runs (acronyms)', () => {
            expect(toCamelCase({ HTTPServer: 1, parseURL: 2 })).toEqual({ httpServer: 1, parseUrl: 2 });
        });

        test('handles dot.case keys', () => {
            expect(toCamelCase({ 'foo.bar.baz': 1 })).toEqual({ fooBarBaz: 1 });
        });

        test('does not recurse into nested objects', () => {
            const input = { outer_key: { inner_key: 1 } };
            expect(toCamelCase(input)).toEqual({ outerKey: { inner_key: 1 } });
        });

        test('handles empty object', () => {
            expect(toCamelCase({})).toEqual({});
        });

        test('handles keys with numbers', () => {
            expect(toCamelCase({ foo_1_bar: 1, v2_api: 2 })).toEqual({ foo1Bar: 1, v2Api: 2 });
        });
    });

    describe('toCamelCaseDeep', () => {
        test('converts nested object keys recursively', () => {
            const input = { outer_key: { inner_key: { deep_key: 1 } } };
            expect(toCamelCaseDeep(input)).toEqual({ outerKey: { innerKey: { deepKey: 1 } } });
        });

        test('converts keys inside arrays of objects', () => {
            const input = { items_list: [{ item_name: 'a' }, { item_name: 'b' }] };
            expect(toCamelCaseDeep(input)).toEqual({ itemsList: [{ itemName: 'a' }, { itemName: 'b' }] });
        });

        test('leaves primitive array values untouched', () => {
            const input = { values_list: [1, 2, 3] };
            expect(toCamelCaseDeep(input)).toEqual({ valuesList: [1, 2, 3] });
        });

        test('does not recurse into non-plain objects (e.g. Date)', () => {
            const date = new Date(0);
            const input = { created_at: date };
            const result = toCamelCaseDeep(input) as { createdAt: Date };
            expect(result.createdAt).toBe(date);
        });

        test('handles null values', () => {
            expect(toCamelCaseDeep({ foo_bar: null })).toEqual({ fooBar: null });
        });
    });

    describe('toSnakeCase', () => {
        test('converts camelCase keys to snake_case', () => {
            expect(toSnakeCase({ fooBar: 1, bazQuxQuux: 2 })).toEqual({ foo_bar: 1, baz_qux_quux: 2 });
        });

        test('converts PascalCase keys to snake_case', () => {
            expect(toSnakeCase({ FooBar: 1 })).toEqual({ foo_bar: 1 });
        });

        test('converts kebab-case keys to snake_case', () => {
            expect(toSnakeCase({ 'foo-bar': 1 })).toEqual({ foo_bar: 1 });
        });

        test('preserves already-snake_case keys', () => {
            expect(toSnakeCase({ foo_bar: 1 })).toEqual({ foo_bar: 1 });
        });

        test('handles acronyms', () => {
            expect(toSnakeCase({ HTTPServer: 1, parseURL: 2 })).toEqual({ http_server: 1, parse_url: 2 });
        });

        test('does not recurse into nested objects', () => {
            const input = { outerKey: { innerKey: 1 } };
            expect(toSnakeCase(input)).toEqual({ outer_key: { innerKey: 1 } });
        });
    });

    describe('toSnakeCaseDeep', () => {
        test('converts nested object keys recursively', () => {
            const input = { outerKey: { innerKey: { deepKey: 1 } } };
            expect(toSnakeCaseDeep(input)).toEqual({ outer_key: { inner_key: { deep_key: 1 } } });
        });

        test('converts keys inside arrays of objects', () => {
            const input = { itemsList: [{ itemName: 'a' }, { itemName: 'b' }] };
            expect(toSnakeCaseDeep(input)).toEqual({ items_list: [{ item_name: 'a' }, { item_name: 'b' }] });
        });

        test('handles null and undefined values', () => {
            expect(toSnakeCaseDeep({ fooBar: null, bazQux: undefined })).toEqual({
                foo_bar: null,
                baz_qux: undefined,
            });
        });
    });
});
