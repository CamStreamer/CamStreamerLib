import { TPlaylistPlayType } from '../types/CamSwitcherAPI';
import { IClient, Options, TParameters, TResponse } from './types';

export const addParametersToPath = (path: string, params?: TParameters) => {
    if (params === undefined || Object.keys(params).length === 0) {
        return path;
    }

    const joinChar = path.indexOf('?') === -1 ? '?' : '&';
    return `${path}${joinChar}${paramToUrl(params)}`;
};

/**
 * A method that converts object parametrs into url string as &name=value.
 *
 * Example:
 *
 * paramToUrl( { name1: value1, name2: value2, name3: value3 } )
 *
 * return "name1=value1&name2=value2&name3=value3"
 */
export const paramToUrl = (params?: TParameters) => {
    if (params === undefined) {
        return '';
    }

    let output = '';
    for (const key in params) {
        const value = params[key];
        if (isNullish(value)) {
            continue;
        }
        output += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
    }

    return output.slice(0, output.length - 1);
};

/**
 * A method that converts array into url string as value,.
 *
 * Example:
 *
 * arrayToUrl( [value1, value2, value3] )
 *
 * return "value1,value2,value3"
 */
export const arrayToUrl = (arr: string | string[]) => {
    if (Array.isArray(arr)) {
        return arr.join(',');
    }
    return arr;
};

export const isCamera = (id?: string) => id?.charAt(0) === 'c';
export const isStream = (id?: string) => id?.charAt(0) === 'c' || id?.charAt(0) === 'a';

export const isClip = (id?: string) => id?.charAt(0) === 's';
export const isTracker = (id?: string) => id?.charAt(0) === 't';
export const isPlaylist = (id?: string) => id?.charAt(0) === 'p';

export const isLoopPlayType = (playType: TPlaylistPlayType) => playType.includes('LOOP');
export function isClient(arg: Options | IClient<TResponse> = {}): arg is IClient<TResponse> {
    return 'get' in arg && 'post' in arg;
}

export async function responseStringify(res: TResponse): Promise<string> {
    return JSON.stringify({
        status: res.status,
        body: await res.text(),
    });
}

export function pad(num: number, size: number) {
    const sign = Math.sign(num) === -1 ? '-' : '';
    return (
        sign +
        new Array(size)
            .concat([Math.abs(num)])
            .join('0')
            .slice(-size)
    );
}

export function isNullish<T>(value: T | undefined | null): value is undefined | null {
    return value === null || value === undefined;
}
