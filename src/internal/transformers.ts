import type {
    CamelCasedProperties,
    CamelCasedPropertiesDeep,
    SnakeCasedProperties,
    SnakeCasedPropertiesDeep,
} from 'type-fest';

export const toCamelCase = <T extends object>(o: T) =>
    mapKeys(o as Record<string, unknown>, camelCase) as CamelCasedProperties<typeof o>;

export const toCamelCaseDeep = <T extends object>(o: T) => {
    return mapKeysDeep(o, camelCase) as CamelCasedPropertiesDeep<typeof o>;
};

export const toSnakeCase = <T extends object>(o: T) =>
    mapKeys(o as Record<string, unknown>, snakeCase) as SnakeCasedProperties<typeof o>;

export const toSnakeCaseDeep = <T extends object>(o: T) => {
    return mapKeysDeep(o, snakeCase) as SnakeCasedPropertiesDeep<typeof o>;
};

/**
 * Split a string into lowercase word tokens, handling camelCase, PascalCase,
 * snake_case, kebab-case, dot.case and consecutive uppercase runs.
 */
const splitWords = (input: string): string[] => {
    if (!input) {
        return [];
    }
    return (
        input
            // Insert a space between consecutive uppercase + uppercase/lowercase boundary (e.g. "HTTPServer" -> "HTTP Server")
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            // Insert a space between lower/number and upper (e.g. "fooBar" -> "foo Bar", "v2Api" -> "v2 Api")
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            // Replace any non-alphanumeric separator with a space
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .trim()
            .split(/\s+/)
            .map((w) => w.toLowerCase())
            .filter((w) => w.length > 0)
    );
};

const camelCase = (key: string): string => {
    const words = splitWords(key);
    if (words.length === 0) {
        return '';
    }
    const [first, ...rest] = words as [string, ...string[]];
    return first + rest.map((w) => w[0]!.toUpperCase() + w.slice(1)).join('');
};

const snakeCase = (key: string): string => splitWords(key).join('_');

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
};

const mapKeys = (obj: Record<string, unknown>, cb: (key: string) => string): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        result[cb(key)] = obj[key];
    }
    return result;
};

const mapKeysDeep = (obj: unknown, cb: (key: string) => string): unknown => {
    if (Array.isArray(obj)) {
        return obj.map((item) => mapKeysDeep(item, cb));
    }
    if (!isPlainObject(obj)) {
        return obj;
    }
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        result[cb(key)] = mapKeysDeep(obj[key], cb);
    }
    return result;
};
