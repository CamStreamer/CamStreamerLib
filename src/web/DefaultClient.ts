import { IClient } from '../internal/common';

export class DefaultClient implements IClient {
    get(url: string, parameters?: Record<string, string>, headers?: Record<string, string>): Promise<Response> {
        return fetch(url + '?' + new URLSearchParams(parameters), {
            method: 'GET',
            headers: headers,
        });
    }
    post(
        url: string,
        data: string | Buffer | FormData,
        parameters?: Record<string, string>,
        headers?: Record<string, string>
    ): Promise<Response> {
        return fetch(url + '?' + new URLSearchParams(parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    }

    url = '';
}
