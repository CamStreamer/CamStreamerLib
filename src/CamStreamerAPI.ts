import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import { TStreamAttributes, TStreamList, streamAttributesSchema, streamListSchema } from './types/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';

const BASE_PATH = '/local/camstreamer';
export class CamStreamerAPI<Client extends IClient<TResponse, any>> {
    constructor(public client: Client) {}

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async getStreamList(options?: THttpRequestOptions): Promise<TStreamList> {
        const streamListRes = await this.get(`${BASE_PATH}/stream/list.cgi`, undefined, options);
        return streamListSchema.parse(streamListRes.data);
    }
    async getStream(streamId: string, options?: THttpRequestOptions): Promise<TStreamAttributes> {
        const stream = await this.get(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        return streamAttributesSchema.parse(stream.data);
    }
    async getStreamParameter(streamId: string, paramName: string, options?: THttpRequestOptions): Promise<string> {
        const stream = await this.get(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        return stream.data[paramName];
    }

    async setStream(
        streamId: string,
        params: Partial<TStreamAttributes>,
        options?: THttpRequestOptions
    ): Promise<void> {
        const { streamDelay, startTime, stopTime, ...rest } = params;
        await this.get(
            `${BASE_PATH}/stream/set.cgi`,
            {
                stream_id: streamId,
                streamDelay: streamDelay ?? '',
                startTime: startTime ?? null,
                stopTime: stopTime ?? null,
                ...rest,
            },
            options
        );
    }
    async setStreamParameter(
        streamId: string,
        paramName: string,
        value: string,
        options?: THttpRequestOptions
    ): Promise<void> {
        await this.get(`${BASE_PATH}/stream/set.cgi?stream_id=${streamId}&${paramName}=${value}`, undefined, options);
    }

    async isStreaming(streamId: string, options?: THttpRequestOptions): Promise<boolean> {
        const response = await this.get(`${BASE_PATH}/get_streamstat.cgi?stream_id=${streamId}`, undefined, options);
        return response.data.is_streaming === 1;
    }
    async deleteStream(streamId: string, options?: THttpRequestOptions): Promise<void> {
        await this.get(`${BASE_PATH}/stream/remove.cgi`, { stream_id: streamId }, options);
    }

    wsAuthorization(options?: THttpRequestOptions): Promise<string> {
        return this.get(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
    }

    async getUtcTime(options?: THttpRequestOptions): Promise<number> {
        return await this.get(`${BASE_PATH}/get_utc_time.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async get(path: string, parameters?: TParameters, options?: THttpRequestOptions): Promise<any> {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
