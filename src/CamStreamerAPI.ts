import { z } from 'zod';
import { ProxyClient } from './internal/ProxyClient';
import { IClient, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import { TStreamAttributes, streamAttributesSchema, streamListSchema } from './types/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';

const BASE_PATH = '/local/camstreamer';
export class CamStreamerAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(public client: Client) {}

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async getStreamList(options?: THttpRequestOptions) {
        const streamListRes = await this.get(`${BASE_PATH}/stream/list.cgi`, undefined, options);
        return streamListSchema.parse(streamListRes.data);
    }
    async getStream(streamId: string, options?: THttpRequestOptions) {
        const stream = await this.get(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        return streamAttributesSchema.parse(stream.data);
    }
    async getStreamParameter(streamId: string, paramName: string, options?: THttpRequestOptions): Promise<string> {
        const stream = await this.get(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        return stream.data[paramName];
    }

    async setStream(streamId: string, params: Partial<TStreamAttributes>, options?: THttpRequestOptions) {
        const { streamDelay, startTime, stopTime, ...rest } = params;
        await this.get(
            `${BASE_PATH}/stream/set.cgi`,
            {
                stream_id: streamId,
                streamDelay: streamDelay ?? '',
                startTime: startTime ?? 'null',
                stopTime: stopTime ?? 'null',
                ...rest,
            },
            options
        );
    }
    async setStreamParameter(streamId: string, paramName: string, value: string, options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/stream/set.cgi?stream_id=${streamId}&${paramName}=${value}`, undefined, options);
    }

    async isStreaming(streamId: string, options?: THttpRequestOptions) {
        const response = await this.get(`${BASE_PATH}/get_streamstat.cgi?stream_id=${streamId}`, undefined, options);
        return response.data.is_streaming === 1;
    }
    async deleteStream(streamId: string, options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/stream/remove.cgi`, { stream_id: streamId }, options);
    }

    wsAuthorization(options?: THttpRequestOptions) {
        const data = this.get(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        return z.string().parse(data);
    }

    async getUtcTime(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/get_utc_time.cgi`, undefined, options);
        return z.number().parse(data);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async get(path: string, parameters?: Record<string, string>, options?: THttpRequestOptions): Promise<any> {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
