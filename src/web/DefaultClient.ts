import { IClient, TGetFunction, TPostFunction } from '../internal/common';
import { addParametersToPath } from '../internal/utils';

export class DefaultClient implements IClient {
    get: TGetFunction<Response> = (url, parameters, headers) => {
        return fetch(addParametersToPath(url, parameters), {
            method: 'GET',
            headers: headers,
        });
    };

    post: TPostFunction<Response> = (url, data, parameters, headers) => {
        return fetch(addParametersToPath(url, parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    };
}
