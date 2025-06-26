import { camelCase, snakeCase, isPlainObject, mapKeys, mapValues } from 'lodash';
import type {
    CamelCasedProperties,
    CamelCasedPropertiesDeep,
    SnakeCasedProperties,
    SnakeCasedPropertiesDeep,
} from 'type-fest';

export const toCamelCase = <T extends object>(o: T) => mapKeys(o, camelCaseKey) as CamelCasedProperties<typeof o>;

export const toCamelCaseDeep = <T extends object>(o: T) => {
    return mapKeysDeep(o, camelCaseKey) as CamelCasedPropertiesDeep<typeof o>;
};

export const toSnakeCase = <T extends object>(o: T) => mapKeys(o, snakeCaseKey) as SnakeCasedProperties<typeof o>;

export const toSnakeCaseDeep = <T extends object>(o: T) => {
    return mapKeysDeep(o, snakeCaseKey) as SnakeCasedPropertiesDeep<typeof o>;
};

const camelCaseKey = (_: unknown, key: string) => camelCase(key);
const snakeCaseKey = (_: unknown, key: string) => snakeCase(key);

const mapKeysDeep = (obj: unknown, cb: (val: unknown, key: string) => string): unknown => {
    if (Array.isArray(obj)) {
        return obj.map((item) => {
            return mapKeysDeep(item, cb);
        });
    }
    if (typeof obj !== 'object' || isPlainObject(obj) === false) {
        return obj;
    }
    const result = mapKeys(obj, cb);
    return mapValues(result, (value: unknown) => {
        return mapKeysDeep(value, cb);
    });
};
