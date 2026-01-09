import { ErrorWithResponse, ParsingBlobError } from '../errors/errors';
import { THttpRequestOptions, TProxyParams } from '../types/common';
import { ProxyClient } from './ProxyClient';
import { IClient, TBlobResponse, TParameters, TResponse } from './types';
import { paramToUrl } from './utils';

export class BasicAPI<Client extends IClient<TResponse, any>> {
    constructor(protected client: Client) {}

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    protected async _getJson(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    protected async _getText(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.text();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    protected async _getBlob(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    private async parseBlobResponse(response: TResponse) {
        try {
            return (await response.blob()) as TBlobResponse<Client>;
        } catch (err) {
            throw new ParsingBlobError(err);
        }
    }

    protected async _post(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({ path, data, parameters, headers, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    protected async _postJsonEncoded(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions
    ) {
        const agent = this.getClient(options?.proxyParams);
        const jsonData = JSON.stringify(data);
        const res = await agent.post({
            path,
            data: jsonData,
            parameters,
            headers: { 'Content-Type': 'application/json' },
            timeout: options?.timeout,
        });

        if (res.ok) {
            return res;
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    protected async _postUrlEncoded(path: string, data: TParameters, options?: THttpRequestOptions) {
        const encodedData = paramToUrl(data);
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path,
            data: encodedData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: options?.timeout,
        });

        if (res.ok) {
            return res;
        } else {
            throw new ErrorWithResponse(res);
        }
    }
}
