import { IClient, TParameters } from '../internal/common';
import { addParametersToPath } from '../internal/utils';

export class DefaultClient implements IClient {
    get(url: string, parameters?: TParameters, headers?: Record<string, string>): Promise<Response> {
        return fetch(addParametersToPath(url, parameters), {
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
        return fetch(addParametersToPath(url, parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    }
}
