import { JsonParseError } from './errors/errors';

/** on some cameras the value of camera param is wrongly encoded twice => JSON.parse will fail \
    in that case try to remove the encoding and try to parse it again */
export const jsonParseCameraParam = (param: string, paramName: string) => {
    if (param === '') {
        return {};
    }
    try {
        return JSON.parse(param);
    } catch {
        try {
            return JSON.parse(decodeURIComponent(param.replaceAll('\\', '')));
        } catch (e) {
            throw new JsonParseError(paramName, param);
        }
    }
};
