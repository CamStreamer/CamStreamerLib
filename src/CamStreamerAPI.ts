import { z } from 'zod';
import { IClient, TResponse } from './internal/types';
import {
    audioFileListSchema,
    diagnosticsSchema,
    srtStreamStatisticsSchema,
    storageListSchema,
    streamSchema,
    streamStatsSchema,
    TAudioFile,
    TAudioFileStorageType,
    TDiagnosticsParams,
    TStream,
} from './types/CamStreamerAPI/CamStreamerAPI';
import { THttpRequestOptions } from './types/common';
import { UtcTimeFetchError, WsAuthorizationError, MigrationError } from './errors/errors';
import {
    oldStringStreamSchema,
    oldStringStreamSchemaWithId,
    TOldStream,
    TOldStringStream,
} from './types/CamStreamerAPI/oldStreamSchema';
import { BasicAPI } from './internal/BasicAPI';
import { streamPlatforms } from './types/CamStreamerAPI';

const BASE_PATH = '/local/camstreamer';
export class CamStreamerAPI<Client extends IClient<TResponse, any>> extends BasicAPI<Client> {
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getWsEventsPath = () => `${BASE_PATH}/events`;

    async checkAPIAvailable(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/api_check.cgi`, undefined, options);
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.data?.state);
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

    async getMaxFps(source = 0, options?: THttpRequestOptions) {
        return await this._getJson(`${BASE_PATH}/get_max_framerate.cgi`, { video_source: source.toString() }, options);
    }

    async isCSPassValid(pass: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/check_pass.cgi`, { pass }, options);
        return res.data === '1';
    }

    async getCamStreamerAppLog(options?: THttpRequestOptions) {
        return await this._getText(`${BASE_PATH}/view_log.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Streams
    //   ----------------------------------------

    async getStreamList<TUnknownStream extends { platform: string }>(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/stream_list.cgi`, { action: 'get' }, options);

        // Do we have the old record format?
        const oldStreamListRecord = z.record(z.string(), oldStringStreamSchema).safeParse(res.data);
        if (oldStreamListRecord.success) {
            // Yes, we do. Convert to array
            const data = Object.entries(oldStreamListRecord.data).map(([streamId, streamData]) => ({
                streamId,
                ...parseCameraStreamResponse(streamData),
            }));
            throw new MigrationError([], data, [], []);
        }

        // No, we have the new array format, possibly with some old settings mixed in
        const newStreamData: TStream[] = [];
        // and possibly with some unknown platforms as well
        const unknownStreamData: TUnknownStream[] = [];

        const oldStreamData: (TOldStream & { streamId: string })[] = [];
        const invalidStreamData: any[] = [];
        for (const streamData of res.data.streamList) {
            // Skip validation for unknown platforms
            if (streamData.platform !== undefined && !Object.values(streamPlatforms).includes(streamData.platform)) {
                unknownStreamData.push(streamData);
                continue;
            }

            const newStreamParse = streamSchema.safeParse(streamData);

            if (newStreamParse.success) {
                newStreamData.push(newStreamParse.data);
                continue;
            }

            const oldStreamParse = oldStringStreamSchemaWithId.safeParse(streamData);
            if (oldStreamParse.success) {
                oldStreamData.push({
                    streamId: oldStreamParse.data.streamId,
                    ...parseCameraStreamResponse(oldStreamParse.data),
                });
                continue;
            }

            invalidStreamData.push(streamData);
        }

        if (oldStreamData.length > 0 || invalidStreamData.length > 0) {
            throw new MigrationError(newStreamData, oldStreamData, invalidStreamData, unknownStreamData);
        }

        return [...newStreamData, ...unknownStreamData];
    }

    // Allow unknown streams in the list
    async setStreamList<TUnknownStream extends { platform: string }>(
        streamList: (TStream | TUnknownStream)[],
        options?: THttpRequestOptions
    ) {
        await this._postJsonEncoded(
            `${BASE_PATH}/stream_list.cgi`,
            { streamList },
            {
                action: 'set',
            },
            options
        );
    }

    /**
     * @throws {MigrationError} If some stream entries failed to parse.
     */
    async getStream(streamId: string, options?: THttpRequestOptions) {
        const res = await this._getJson(
            `${BASE_PATH}/stream_list.cgi`,
            { action: 'get', stream_id: streamId },
            options
        );

        // No unknown stream here, do not allow it
        const newStream = streamSchema.safeParse(res.data);
        if (newStream.success) {
            return newStream.data;
        }

        // May or may not have id inside -> passthrough to keep it if present
        const oldStream = oldStringStreamSchema.passthrough().parse(res.data);
        throw new MigrationError([], [{ streamId, ...parseCameraStreamResponse(oldStream) }], [], []);
    }

    async setStream(streamId: string, streamData: TStream, options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/stream_list.cgi`,
            streamData,
            {
                action: 'set',
                stream_id: streamId,
            },
            options
        );
    }

    async getStreamNetworkStatistics(streamId: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_streamstat.cgi`, { stream_id: streamId }, options);
        return streamStatsSchema.parse(res.data);
    }

    async getSrtStreamStatistics(streamId: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/srt_statistics.cgi`, { stream_id: streamId }, options);
        return srtStreamStatisticsSchema.parse(res.data);
    }

    async setStreamEnabled(streamId: string, enabled: boolean, options?: THttpRequestOptions) {
        await this._postUrlEncoded(
            `${BASE_PATH}/set_stream_enabled.cgi`,
            { stream_id: streamId, enabled: enabled ? 1 : 0 },
            options
        );
    }

    async setStreamActive(streamId: string, active: boolean, options?: THttpRequestOptions) {
        await this._postUrlEncoded(
            `${BASE_PATH}/set_stream_active.cgi`,
            { stream_id: streamId, active: active ? 1 : 0 },
            options
        );
    }

    async deleteStream(streamId: string, options?: THttpRequestOptions) {
        const streamList = await this.getStreamList(options);
        const filteredList = streamList.filter((stream) => !('streamId' in stream) || stream.streamId !== streamId);
        if (filteredList.length === streamList.length) {
            return;
        }
        await this.setStreamList(filteredList, options);
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
        await this._postUrlEncoded(`${BASE_PATH}/upload_audio.cgi`, { action: 'remove', ...fileParams }, options);
    }

    async getFileStorage(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/upload_audio.cgi`, { action: 'get_storage' }, options);
        return storageListSchema.parse(res.data);
    }

    async getFileFromCamera(path: string, options?: THttpRequestOptions) {
        return await this._getBlob(`${BASE_PATH}/audio.cgi`, { path }, options);
    }

    //   ----------------------------------------
    //                   Report
    //   ----------------------------------------

    downloadReport(options?: THttpRequestOptions) {
        return this._getText(`${BASE_PATH}/report.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Diagnostics
    //   ----------------------------------------
    async getDiagnostics(params: TDiagnosticsParams, options?: THttpRequestOptions) {
        const convertedParams: Record<keyof TDiagnosticsParams, string | undefined> = {
            camerainfo: params.camerainfo ? '1' : '0',
            checkserver: params.checkserver ? '1' : '0',
            checkservertime: params.checkservertime ? '1' : '0',
            speedtest: params.speedtest ? '1' : '0',
            pingtest: params.pingtest ? '1' : '0',
            videoHostPort: params.videoHostPort,
            audioHostPort: params.audioHostPort,
        };
        const res = await this._getJson(`${BASE_PATH}/diagnostics.cgi`, convertedParams, options);
        return diagnosticsSchema.parse(res);
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
