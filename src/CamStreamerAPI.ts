import { IClient, isClient, HttpOptions, responseStringify } from './internal/common';
import { DefaultAgent } from './DefaultAgent';

export type CamStreamerAPIOptions = HttpOptions;

export type TStreamAttributes = {
    enabled: string;
    active: string;
    audioSource: string;
    avSyncMsec: string;
    internalVapixParameters: string;
    userVapixParameters: string;
    outputParameters: string;
    outputType: string;
    mediaServerUrl: string;
    inputType: string;
    inputUrl: string;
    forceStereo: string;
    streamDelay: string;
    statusLed: string;
    statusPort: string;
    callApi: string;
    trigger: string;
    schedule: string;
    prepareAhead: string;
    startTime: string;
    stopTime: string;
};
export type TStreamList = Record<string, TStreamAttributes>;

export class CamStreamerAPI {
    private client: IClient;

    constructor(options: CamStreamerAPIOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    async getStreamList(): Promise<TStreamList> {
        const streamListRes = await this.get('/local/camstreamer/stream/list.cgi');
        return streamListRes.data;
    }
    async getStream(streamID: string): Promise<TStreamAttributes> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`);
        return stream.data;
    }
    async getStreamParameter(streamID: string, paramName: string): Promise<string> {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`);
        return stream.data[paramName];
    }

    async setStream(streamID: string, params: TStreamAttributes): Promise<void> {
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

    private async get(path: string, parameters?: Record<string, string>): Promise<any> {
        const res = await this.client.get(path, parameters);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
