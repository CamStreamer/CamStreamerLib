import { z } from 'zod';
import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';

import {
    audioFileListSchema,
    storageListSchema,
    streamSchema,
    TAudioFile,
    TAudioFileStorageType,
    TStream,
    TStreamList,
} from './types/CamStreamerAPI/CamStreamerAPI';
import { THttpRequestOptions, TProxyParams } from './types/common';
import { ErrorWithResponse, UtcTimeFetchError, WsAuthorizationError, MigrationError } from './errors/errors';
import {
    oldStringStreamSchema,
    oldStringStreamSchemaWithId,
    TOldStream,
    TOldStringStream,
} from './types/CamStreamerAPI/oldStreamSchema';
import { paramToUrl } from './internal/utils';

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

    async getStreamList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream_list.cgi`, { action: 'get' }, options);

        // Do we have the old record format?
        const oldStreamListRecord = z.record(z.string(), oldStringStreamSchema).safeParse(res.data);
        if (oldStreamListRecord.success) {
            // Yes, we do. Convert to array
            const data = Object.entries(oldStreamListRecord.data).map(([id, streamData]) => ({
                id: parseInt(id),
                ...parseCameraStreamResponse(streamData),
            }));
            throw new MigrationError([], data);
        }

        // No, we have the new array format, possibly with some old settings mixed in
        const newStreamData: TStream[] = [];
        const oldStreamData: (TOldStream & { id: number })[] = [];
        for (const streamData of res.data.streamList) {
            const newStreamParse = streamSchema.safeParse(streamData);
            if (newStreamParse.success) {
                newStreamData.push(newStreamParse.data);
                continue;
            }

            const oldStreamParse = oldStringStreamSchemaWithId.safeParse(streamData);
            if (oldStreamParse.success) {
                oldStreamData.push({
                    id: parseInt(oldStreamParse.data.id),
                    ...parseCameraStreamResponse(oldStreamParse.data),
                });
                continue;
            }

            // Not a problem with migration at all, something else is wrong
            throw new Error('Failed to parse some stream entries');
        }

        if (oldStreamData.length > 0) {
            throw new MigrationError(newStreamData, oldStreamData);
        }

        return newStreamData;
    }

    async setStreamList(streamList: TStreamList['streamList'], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/stream_list.cgi`,
            JSON.stringify({ streamList }),
            {
                action: 'set',
            },
            options
        );
    }

    /**
     * @throws {MigrationError} If some stream entries failed to parse.
     */
    async getStream(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(
            `${BASE_PATH}/stream_list.cgi`,
            { action: 'get', stream_id: streamId },
            options
        );

        const newStream = streamSchema.safeParse(res.data);
        if (newStream.success) {
            return newStream.data;
        }

        // May or may not have id inside -> passthrough to keep it if present
        const oldStream = oldStringStreamSchema.passthrough().parse(res.data);
        throw new MigrationError([], [{ id: streamId, ...parseCameraStreamResponse(oldStream) }]);
    }

    async setStream(streamId: number, streamData: Partial<TStream>, options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/stream_list.cgi`,
            JSON.stringify(streamData),
            {
                action: 'set',
                stream_id: streamId,
            },
            options
        );
    }

    async isStreaming(streamId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_streamstat.cgi`, { stream_id: streamId }, options);
        return res.data.is_streaming === 1;
    }

    //   ----------------------------------------
    //                 Audio Files
    //   ----------------------------------------

    async listFiles(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/upload_audio.cgi`, { action: 'list' }, options);
        return audioFileListSchema.parse(res.data);
    }

    async uploadFile(
        formData: Parameters<Client['post']>[0]['data'],
        storage: TAudioFileStorageType,
        options?: THttpRequestOptions
    ) {
        await this._post(
            `${BASE_PATH}/upload_audio.cgi`,
            formData,
            {
                action: 'upload',
                storage: storage,
            },
            options
        );
    }

    async removeFile(fileParams: TAudioFile, options?: THttpRequestOptions) {
        await this._postUrlEncoded(
            `${BASE_PATH}/upload_audio.cgi`,
            { action: 'remove', ...fileParams },
            options,
            undefined
        );
    }

    async getFileStorage(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/upload_audio.cgi`, { action: 'get_storage' }, options);
        return storageListSchema.parse(res.data);
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

    private async _postUrlEncoded(
        path: string,
        parameters: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const data = paramToUrl(parameters);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post(path, data, undefined, options, { ...baseHeaders, ...headers });
    }

    private async _postJsonEncoded(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const agent = this.getClient(options?.proxyParams);
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return agent.post({
            path,
            data,
            parameters,
            timeout: options?.timeout,
            headers: { ...baseHeaders, ...headers },
        });
    }

    private async _post(
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
