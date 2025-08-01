import { IClient, TGetParams, TPostParams } from '../internal/types';
import { addParametersToPath } from '../internal/utils';

export class DefaultClient implements IClient<Response> {
    get = (...params: TGetParams) => {
        const [url, parameters, headers] = params;
        return fetch(addParametersToPath(url, parameters), {
            method: 'GET',
            headers: headers,
        });
    };

    post = (...params: TPostParams) => {
        const [url, data, parameters, headers] = params;
        return fetch(addParametersToPath(url, parameters), {
            method: 'POST',
            body: data,
            headers: headers,
        });
    };
}
