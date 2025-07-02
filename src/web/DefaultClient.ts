import { IClient, TParameters } from '../internal/common';

export class DefaultClient implements IClient {
    get(url: string, parameters?: TParameters, headers?: Record<string, string>): Promise<Response> {
        return fetch(this.getPathWithParams(url, parameters), {
            method: 'GET',
            headers: headers,
        });
    }
    post(
        url: string,
        data: string | Buffer | FormData,
        parameters?: TParameters,
        headers?: Record<string, string>
    ): Promise<Response> {
        return fetch(this.getPathWithParams(url, parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    }

    getPathWithParams(path: string, params: TParameters = {}): string {
        let pathName = path;

        if (pathName.indexOf('?') === -1) {
            pathName += '?';
        } else {
            pathName += '&';
        }

        for (const key in params) {
            pathName += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
        }
        return pathName.slice(0, pathName.length - 1);
    }
}
