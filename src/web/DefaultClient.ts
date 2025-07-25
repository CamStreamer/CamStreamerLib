import { IClient, TGetFunction, TPostFunction, TResponse } from '../internal/common';
import { addParametersToPath } from '../internal/utils';

export class DefaultClient implements IClient {
    get: TGetFunction<TResponse & { blob: () => Promise<Blob> }> = (url, parameters, headers) => {
        return fetch(addParametersToPath(url, parameters), {
            method: 'GET',
            headers: headers,
        });
    };

    post: TPostFunction<TResponse & { blob: () => Promise<Blob> }> = (url, data, parameters, headers) => {
        return fetch(addParametersToPath(url, parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    };
}
