import { z } from 'zod';
import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import { cameraStreamSchema, TCameraStream, TStream } from './types/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';

const BASE_PATH = '/local/camstreamer';
export class CamStreamerAPI<Client extends IClient<TResponse, any>> {
    constructor(public client: Client) {}

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async getStreamList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/list.cgi`, undefined, options);

        const list = z.record(z.string(), cameraStreamSchema).parse(res.data);
        const streamList: Record<number, TStream> = {};

        for (const [key, data] of Object.entries(list)) {
            const streamId = parseInt(key);
            streamList[streamId] = parseCameraStreamResponse(data);
        }
        return streamList;
    }

    async getStream(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        const cameraData = cameraStreamSchema.parse(res.data);
        return parseCameraStreamResponse(cameraData);
    }

    async getStreamParameter(streamId: number, paramName: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/get.cgi?stream_id=${streamId}`, undefined, options);
        return z.string().parse(res.data[paramName]);
    }

    async setStream(
        streamId: number,
        params: Partial<TStream>,
        options?: THttpRequestOptions
    ): Promise<{ message: string; status: number }> {
        const { streamDelay, startTime, stopTime, ...rest } = params;
        return await this._getJson(
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
        streamId: number,
        paramName: string,
        value: string,
        options?: THttpRequestOptions
    ): Promise<{ message: string; status: number }> {
        return await this._getJson(`${BASE_PATH}/stream/set.cgi`, { stream_id: streamId, [paramName]: value }, options);
    }

    async isStreaming(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_streamstat.cgi`, { stream_id: streamId }, options);
        return res.data.is_streaming === 1;
    }
    async deleteStream(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/remove.cgi`, { stream_id: streamId }, options);
        return res.data.status === 200;
    }

    async wsAuthorization(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        if (res.status !== 200) {
            throw new Error(`Server error on ws authorization: ${res.message}`);
        }
        return z.string().parse(res.data);
    }

    async getUtcTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_utc_time.cgi`, undefined, options);
        if (res.status !== 200) {
            throw new Error(`Server error on get UTC time: ${res.message}`);
        }
        return z.number().parse(res.data);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async _getJson(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}

export const parseCameraStreamResponse = (cameraStreamData: TCameraStream): TStream => {
    return {
        enabled: parseInt(cameraStreamData.enabled) as 0 | 1,
        active: parseInt(cameraStreamData.active) as 0 | 1,
        audioSource: cameraStreamData.audioSource,
        avSyncMsec: parseInt(cameraStreamData.avSyncMsec),
        internalVapixParameters: cameraStreamData.internalVapixParameters,
        userVapixParameters: cameraStreamData.userVapixParameters,
        outputParameters: cameraStreamData.outputParameters,
        outputType: cameraStreamData.outputType as TStream['outputType'],
        mediaServerUrl: cameraStreamData.mediaServerUrl,
        inputType: cameraStreamData.inputType as TStream['inputType'],
        inputUrl: cameraStreamData.inputUrl,
        forceStereo: parseInt(cameraStreamData.forceStereo) as 0 | 1,
        streamDelay: isNaN(parseInt(cameraStreamData.streamDelay)) ? null : parseInt(cameraStreamData.streamDelay),
        statusLed: parseInt(cameraStreamData.statusLed),
        statusPort: cameraStreamData.statusPort,
        callApi: parseInt(cameraStreamData.callApi),
        trigger: cameraStreamData.trigger,
        schedule: cameraStreamData.schedule,
        prepareAhead: parseInt(cameraStreamData.prepareAhead),
        startTime: isNaN(parseInt(cameraStreamData.startTime)) ? null : parseInt(cameraStreamData.startTime),
        stopTime: isNaN(parseInt(cameraStreamData.stopTime)) ? null : parseInt(cameraStreamData.stopTime),
    };
};
