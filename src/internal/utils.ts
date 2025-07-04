import { TPlaylistPlayType } from '../types/CamSwitcherAPI';
import { TParameters } from './common';

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
    let output = '';
    if (params) {
        const reducer = (res: string, key: string) => {
            if (params[key] !== undefined) {
                return `${res}${key}=${encodeURIComponent(String(params[key]))}&`;
            }
            return res;
        };
        output = Object.keys(params).reduce(reducer, '');
        output = output.slice(0, output.length - 1);
    }
    return output;
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
