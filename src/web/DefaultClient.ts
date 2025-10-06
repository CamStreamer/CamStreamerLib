import { IClient, TGetParams, TPostParams } from '../internal/types';
import { addParametersToPath } from '../internal/utils';

export class DefaultClient implements IClient<Response, FormData | ArrayBuffer> {
    get = (params: TGetParams) => {
        return this.fetchWithTimeout(
            addParametersToPath(params.path, params.parameters),
            {
                method: 'GET',
                headers: params.headers,
            },
            params.timeout
        );
    };

    post = (params: TPostParams<FormData | ArrayBuffer>) => {
        return this.fetchWithTimeout(
            addParametersToPath(params.path, params.parameters),
            {
                method: 'POST',
                body: params.data,
                headers: params.headers,
            },
            params.timeout
        );
    };

    private async fetchWithTimeout(url: string, options: RequestInit, timeout?: number): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = timeout !== undefined ? setTimeout(() => controller.abort(), timeout) : null;
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }
}
