import { z } from 'zod';
import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';

import { streamSchema, TStream } from './types/CamStreamerAPI/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';
import { ErrorWithResponse, UtcTimeFetchError, WsAuthorizationError, MigrationError } from './errors/errors';
import { oldStringStreamSchema, TOldStream, TOldStringStream } from './types/CamStreamerAPI/oldStreamSchema';

const BASE_PATH = '/local/camstreamer';
export class CamStreamerAPI<Client extends IClient<TResponse, any>> {
    constructor(private client: Client) {}

    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async wsAuthorization(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        if (res.status !== 200) {
            throw new WsAuthorizationError(res.message);
        }
        return z.string().parse(res.data);
    }

    async getUtcTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_utc_time.cgi`, undefined, options);
        if (res.status !== 200) {
            throw new UtcTimeFetchError(res.message);
        }
        return z.number().parse(res.data);
    }

    //   ----------------------------------------
    //                   Streams
    //   ----------------------------------------

    /**
     * @throws {MigrationError} If some stream entries failed to parse.
     */
    async getStreamList(options?: THttpRequestOptions): Promise<Record<number, TStream>> {
        const res = await this._getJson(`${BASE_PATH}/stream/list.cgi`, undefined, options);

        const streamList: Record<number, TStream> = {};
        const invalidList: Record<number, TOldStream> = {};

        for (const [key, value] of Object.entries(res.data)) {
            const id = parseInt(key);
            try {
                const parsed = streamSchema.parse(value);
                streamList[id] = parsed;
            } catch (err) {
                const oldStream = oldStringStreamSchema.parse(value);
                const parsedOldStream = parseCameraStreamResponse(oldStream);
                invalidList[id] = parsedOldStream;
            }
        }

        if (Object.keys(invalidList).length > 0) {
            throw new MigrationError(streamList, invalidList);
        }

        return streamList;
    }

    /**
     * @throws {MigrationError} If some stream entries failed to parse.
     */
    async getStream(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/get.cgi`, { stream_id: streamId }, options);
        try {
            return streamSchema.parse(res.data);
        } catch (err) {
            const oldStream = oldStringStreamSchema.parse(res.data);
            const parsedOldStream = parseCameraStreamResponse(oldStream);
            throw new MigrationError({}, { [streamId]: parsedOldStream });
        }
    }

    async setStream(streamId: number, streamData: Partial<TStream>, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        await agent.post({
            path: `${BASE_PATH}/stream/set.cgi`,
            data: JSON.stringify(streamData),
            parameters: {
                stream_id: streamId,
            },
            timeout: options?.timeout,
        });
    }

    async isStreaming(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_streamstat.cgi`, { stream_id: streamId }, options);
        return res.data.is_streaming === 1;
    }
    async deleteStream(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream/remove.cgi`, { stream_id: streamId }, options);
        return res.data.status === 200;
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
            throw new ErrorWithResponse(res);
        }
    }
}

export const parseCameraStreamResponse = (cameraStreamData: TOldStringStream): TOldStream => {
    return {
        enabled: parseInt(cameraStreamData.enabled) as 0 | 1,
        active: parseInt(cameraStreamData.active) as 0 | 1,
        audioSource: cameraStreamData.audioSource,
        avSyncMsec: parseInt(cameraStreamData.avSyncMsec),
        internalVapixParameters: cameraStreamData.internalVapixParameters,
        userVapixParameters: cameraStreamData.userVapixParameters,
        outputParameters: cameraStreamData.outputParameters,
        outputType: cameraStreamData.outputType as TOldStream['outputType'],
        mediaServerUrl: cameraStreamData.mediaServerUrl,
        inputType: cameraStreamData.inputType as TOldStream['inputType'],
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
