import { Options } from './common';
import { httpRequest, HttpRequestOptions } from './HttpRequest';

export type CamStreamerAPIOptions = Options;

export class CamStreamerAPI {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;

    constructor(options?: CamStreamerAPIOptions) {
        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';
    }

    async getStreamList() {
        const streamListRes = await this.get('/local/camstreamer/stream/list.cgi');
        return streamListRes.data;
    }

    async getStreamParameter(streamID: string, paramName: string) {
        const stream = await this.get(`/local/camstreamer/stream/get.cgi?stream_id=${streamID}`);
        return stream.data[paramName];
    }

    async setStreamParameter(streamID: string, paramName: string, value: string) {
        return await this.get(`/local/camstreamer/stream/set.cgi?stream_id=${streamID}&${paramName}=${value}`);
    }

    async isStreaming(streamID: string) {
        const response = await this.get(`/local/camstreamer/get_streamstat.cgi?stream_id=${streamID}`);
        return response.data.is_streaming;
    }

    async get(path: string) {
        const options = this.getBaseConnectionParams();
        options.path = encodeURI(path);
        const data = (await httpRequest(options)) as string;
        return JSON.parse(data);
    }

    private getBaseConnectionParams(): HttpRequestOptions {
        return {
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }
}
