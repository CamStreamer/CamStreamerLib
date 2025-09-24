import { ProxyClient } from './internal/ProxyClient';
import { IClient, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import { TStreamAttributes, TStreamList, streamAttributesSchema, streamListSchema } from './types/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';

export class CamStreamerAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(public client: Client) {}

    async getStreamList(options?: THttpRequestOptions): Promise<TStreamList> {
        const streamListRes = await this.get('/local/camstreamer/stream/list.cgi', undefined, options);
        return streamListSchema.parse(streamListRes.data);
    }
    async getStream(streamID: string, options?: THttpRequestOptions): Promise<TStreamAttributes> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`, undefined, options);
        return streamAttributesSchema.parse(stream.data);
    }
    async getStreamParameter(streamID: string, paramName: string, options?: THttpRequestOptions): Promise<string> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`, undefined, options);
        return stream.data[paramName];
    }

    async setStream(
        streamID: string,
        params: Partial<TStreamAttributes>,
        options?: THttpRequestOptions
    ): Promise<void> {
        const { streamDelay, startTime, stopTime, ...rest } = params;
        await this.get(
            '/local/camstreamer/stream/set.cgi',
            {
                stream_id: streamID,
                streamDelay: streamDelay ?? '',
                startTime: startTime ?? 'null',
                stopTime: stopTime ?? 'null',
                ...rest,
            },
            options
        );
    }
    async setStreamParameter(
        streamID: string,
        paramName: string,
        value: string,
        options?: THttpRequestOptions
    ): Promise<void> {
        await this.get(
            `/local/camstreamer/stream/set.cgi?stream_id=${streamID}&${paramName}=${value}`,
            undefined,
            options
        );
    }

    async isStreaming(streamID: string, options?: THttpRequestOptions): Promise<boolean> {
        const response = await this.get(
            `/local/camstreamer/get_streamstat.cgi?stream_id=${streamID}`,
            undefined,
            options
        );
        return response.data.is_streaming === 1;
    }
    async deleteStream(streamID: string, options?: THttpRequestOptions): Promise<void> {
        await this.get('/local/camstreamer/stream/remove.cgi', { stream_id: streamID }, options);
    }

    wsAuthorization(options?: THttpRequestOptions): Promise<string> {
        return this.get('/local/camstreamer/ws_authorization.cgi', undefined, options);
    }

    async getUtcTime(options?: THttpRequestOptions): Promise<number> {
        return await this.get('/local/camstreamer/get_utc_time.cgi', undefined, options);
    }

    private async get(path: string, parameters?: Record<string, string>, options?: THttpRequestOptions): Promise<any> {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private getAgent(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }
}
