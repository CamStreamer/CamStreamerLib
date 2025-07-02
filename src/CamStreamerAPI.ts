import { IClient, isClient, responseStringify } from './internal/common';
import { DefaultClient } from './node/DefaultClient';

import {
    CamStreamerAPIOptions,
    TStreamAttributes,
    TStreamList,
    streamAttributesSchema,
    streamListSchema,
} from './types/CamStreamerAPI';

export class CamStreamerAPI {
    private client: IClient;

    constructor(options: CamStreamerAPIOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultClient(options);
        }
    }

    async getStreamList(): Promise<TStreamList> {
        const streamListRes = await this.get('/local/camstreamer/stream/list.cgi');
        return streamListSchema.parse(streamListRes.data);
    }
    async getStream(streamID: string): Promise<TStreamAttributes> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`);
        return streamAttributesSchema.parse(stream.data);
    }
    async getStreamParameter(streamID: string, paramName: string): Promise<string> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`);
        return stream.data[paramName];
    }

    async setStream(streamID: string, params: Partial<TStreamAttributes>): Promise<void> {
        const { streamDelay, startTime, stopTime, ...rest } = params;
        await this.get('/local/camstreamer/stream/set.cgi', {
            stream_id: streamID,
            streamDelay: streamDelay ?? '',
            startTime: startTime ?? 'null',
            stopTime: stopTime ?? 'null',
            ...rest,
        });
    }
    async setStreamParameter(streamID: string, paramName: string, value: string): Promise<void> {
        await this.get(`/local/camstreamer/stream/set.cgi?stream_id=${streamID}&${paramName}=${value}`);
    }

    async isStreaming(streamID: string): Promise<boolean> {
        const response = await this.get(`/local/camstreamer/get_streamstat.cgi?stream_id=${streamID}`);
        return response.data.is_streaming === 1;
    }
    async deleteStream(streamID: string): Promise<void> {
        await this.get('/local/camstreamer/stream/remove.cgi', { stream_id: streamID });
    }

    wsAutoratization(): Promise<string> {
        return this.get('/local/camstreamer/ws_authorization.cgi');
    }

    async getUtcTime(): Promise<number> {
        return await this.get('/local/camstreamer/get_utc_time.cgi');
    }

    private async get(path: string, parameters?: Record<string, string>): Promise<any> {
        const res = await this.client.get(path, parameters);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
