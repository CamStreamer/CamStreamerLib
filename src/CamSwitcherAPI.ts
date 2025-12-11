import { z } from 'zod';
import { AddNewClipError, JsonParseError, ParameterNotFoundError, ErrorWithResponse } from './errors/errors';
import { IClient, TParameters, TResponse } from './internal/types';
import { parseBitrateOptionsToVapixParams, parseVapixParamsToBitrateOptions } from './internal/convertors';
import { isClip, isNullish } from './internal/utils';
import {
    storageInfoListSchema,
    outputInfoSchema,
    audioPushInfoSchema,
    clipListSchema,
    playlistQueueSchema,
    TStreamSaveList,
    streamSaveLoadSchema,
    clipSaveLoadSchema,
    playlistSaveLoadSchema,
    trackerSaveLoadSchema,
    TTrackerSaveList,
    TClipSaveList,
    TPlaylistSaveList,
    TCameraOptions,
    TGlobalAudioSettings,
    TSecondaryAudioSettings,
    secondaryAudioSettingsSchema,
    globalAudioSettingsSchema,
} from './types/CamSwitcherAPI';
import {
    networkCameraListSchema,
    TAudioChannel,
    THttpRequestOptions,
    TProxyParams,
    TStorageType,
    TBitrateVapixParams,
} from './types/common';
import { VapixAPI } from './VapixAPI';
import { ProxyClient } from './internal/ProxyClient';

const BASE_PATH = '/local/camswitcher/api';
export class CamSwitcherAPI<Client extends IClient<TResponse, any>> {
    private vapixAgent: VapixAPI<Client>;

    constructor(private client: Client, private CustomFormData = FormData) {
        this.vapixAgent = new VapixAPI(client);
    }

    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getWsEventsPath = () => `/local/camswitcher/events`;
    static getClipPreviewPath = (clipId: string, storage: TStorageType) =>
        `${BASE_PATH}/clip_preview.cgi?clip_name=${clipId}&storage=${storage}`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.data);
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(res.data);
    }

    async generateSilence(sampleRate: number, channels: TAudioChannel, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        await agent.get({
            path: `${BASE_PATH}/generate_silence.cgi`,
            parameters: {
                sample_rate: sampleRate.toString(),
                channels,
            },
            timeout: options?.timeout,
        });
    }

    async getMaxFps(source: number, options?: THttpRequestOptions) {
        const res = await this._getJson(
            `${BASE_PATH}/get_max_framerate.cgi`,
            {
                video_source: source,
            },
            options
        );
        return z.number().parse(res.data);
    }

    async getStorageInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/get_storage.cgi`, undefined, options);
        return storageInfoListSchema.parse(res.data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAuthorization(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        return z.string().parse(res.data);
    }

    async getOutputInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/output_info.cgi`, undefined, options);
        return outputInfoSchema.parse(res.data);
    }

    async getAudioPushInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/audio_push_info.cgi`, undefined, options);
        return audioPushInfoSchema.parse(res.data);
    }

    //   ----------------------------------------
    //                   Sources
    //   ----------------------------------------

    async getStreamSaveList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/streams.cgi`, { action: 'get' }, options);
        return streamSaveLoadSchema.parse(res.data);
    }

    async getClipSaveList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/clips.cgi`, { action: 'get' }, options);
        return clipSaveLoadSchema.parse(res.data);
    }

    async getPlaylistSaveList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/playlists.cgi`, { action: 'get' }, options);
        return playlistSaveLoadSchema.parse(res.data);
    }

    async getTrackerSaveList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/trackers.cgi`, { action: 'get' }, options);
        return trackerSaveLoadSchema.parse(res.data);
    }

    async setStreamSaveList(data: TStreamSaveList, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/streams.cgi`, JSON.stringify(data), { action: 'set' }, options);
    }

    async setClipSaveList(data: TClipSaveList, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/clips.cgi`, JSON.stringify(data), { action: 'set' }, options);
    }

    async setPlaylistSaveList(data: TPlaylistSaveList, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/playlists.cgi`, JSON.stringify(data), { action: 'set' }, options);
    }

    async setTrackerSaveList(data: TTrackerSaveList, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/trackers.cgi`, JSON.stringify(data), { action: 'set' }, options);
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    async playlistSwitch(playlistName: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/playlist_switch.cgi`, { playlist_name: playlistName }, options);
    }
    async playlistQueuePush(playlistName: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/playlist_queue_push.cgi`, { playlist_name: playlistName }, options);
    }
    async playlistQueueClear(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/playlist_queue_clear.cgi`, undefined, options);
    }
    async playlistQueueList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/playlist_queue_list.cgi`, undefined, options);
        return playlistQueueSchema.parse(res.data).playlistQueueList;
    }
    async playlistQueuePlayNext(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/playlist_queue_play_next.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    async addNewClip(
        file: any, // Buffer | File
        clipType: 'video' | 'audio',
        storage: TStorageType,
        clipId: string,
        fileName?: string,
        options?: THttpRequestOptions
    ) {
        const path = `${BASE_PATH}/clip_upload.cgi`;

        const formData = new this.CustomFormData();
        formData.append('clip_name', clipId);
        formData.append('clip_type', clipType);
        formData.append('file', file, fileName);

        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path,
            data: formData,
            parameters: {
                storage: storage,
            },
            timeout: options?.timeout,
        });
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new AddNewClipError(output.message);
        }
    }

    async removeClip(clipId: string, storage: TStorageType, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/clip_remove.cgi`, { clip_name: clipId, storage }, options);
    }

    async getClipList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/clip_list.cgi`, undefined, options);
        return clipListSchema.parse(res.data).clip_list;
    }

    //   ----------------------------------------
    //               Configuration
    //   ----------------------------------------

    //* ******************   Set

    setCamSwitchOptions(data: TCameraOptions, cameraFWVersion: string, options?: THttpRequestOptions) {
        const bitrateData: Partial<TBitrateVapixParams> = {
            bitrateMode: data.bitrateMode,
            maximumBitRate: data.maximumBitRate,
            retentionTime: data.retentionTime,
            bitRateLimit: data.bitRateLimit,
        };
        const bitrateVapixParams = parseBitrateOptionsToVapixParams(cameraFWVersion, data.bitrateMode, bitrateData);
        const saveData = {
            video: {
                resolution: data.resolution,
                h264Profile: data.h264Profile,
                fps: data.fps,
                compression: data.compression,
                govLength: data.govLength,
                videoClipQuality: data.maximumBitRate,
                bitrateVapixParams: bitrateVapixParams,
            },
            audio: {
                sampleRate: data.audioSampleRate,
                channelCount: data.audioChannelCount,
            },
            keyboard: data.keyboard,
        };

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SETTINGS, saveData, options);
    }

    setGlobalAudioSettings(settings: TGlobalAudioSettings, options?: THttpRequestOptions) {
        let acceptedType = 'NONE';
        if (settings.type === 'source' && settings.source) {
            if (isClip(settings.source)) {
                acceptedType = 'CLIP';
            } else {
                acceptedType = 'STREAM';
            }
        }
        const data = {
            type: acceptedType,
            stream_name: settings.source,
            clip_name: settings.source,
            storage: settings.storage,
        };

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.MASTER_AUDIO, data, options);
    }

    setSecondaryAudioSettings(settings: TSecondaryAudioSettings, options?: THttpRequestOptions) {
        const data = {
            type: settings.type,
            stream_name: settings.streamName ?? '',
            clip_name: settings.clipName ?? '',
            storage: settings.storage,
            secondary_audio_level: settings.secondaryAudioLevel,
            master_audio_level: settings.masterAudioLevel,
        };

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SECONDARY_AUDIO, data, options);
    }

    setDefaultPlaylist(playlistId: string, options?: THttpRequestOptions) {
        const value = JSON.stringify({ default_playlist_id: playlistId });
        return this.vapixAgent.setParameter(
            {
                [CSW_PARAM_NAMES.DEFAULT_PLAYLIST]: value,
            },
            options
        );
    }

    setPermanentRtspUrlToken(token: string, options?: THttpRequestOptions) {
        return this.vapixAgent.setParameter({ [CSW_PARAM_NAMES.RTSP_TOKEN]: token }, options);
    }

    //* ******************   Get

    async getCamSwitchOptions(options?: THttpRequestOptions) {
        const saveData = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SETTINGS, options);

        if (isNullish(saveData.video)) {
            // No info setted
            return saveData;
        }

        if (!isNullish(saveData.video?.bitrateVapixParams)) {
            const bitrateOptions = parseVapixParamsToBitrateOptions(saveData.video.bitrateVapixParams);
            saveData.video.bitrateMode = bitrateOptions.bitrateMode;
            saveData.video.maximumBitRate = bitrateOptions.maximumBitRate;
            saveData.video.retentionTime = bitrateOptions.retentionTime;
            saveData.video.bitRateLimit = bitrateOptions.bitRateLimit;
        }

        if (!isNullish(saveData.video?.bitrateLimit)) {
            saveData.video.maximumBitRate = saveData.video.bitrateLimit;
            saveData.video.bitrateMode = 'MBR';
        }
        if (!isNullish(saveData.video?.videoClipQuality)) {
            saveData.video.maximumBitRate = saveData.video.videoClipQuality;
        }

        return {
            ...saveData.video,
            audioSampleRate: saveData.audio.sampleRate,
            audioChannelCount: saveData.audio.channelCount,
            keyboard: saveData.keyboard,
        };
    }

    async getGlobalAudioSettings(options?: THttpRequestOptions) {
        const settings: TGlobalAudioSettings = {
            type: 'fromSource',
            source: 'fromSource',
        };

        const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.MASTER_AUDIO, options);
        if (res.type === 'STREAM') {
            settings.type = 'source';
            settings.source = res.stream_name;
        } else if (res.type === 'CLIP') {
            settings.type = 'source';
            settings.source = res.clip_name;
            settings.storage = res.storage;
        }

        return globalAudioSettingsSchema.parse(settings);
    }

    async getSecondaryAudioSettings(options?: THttpRequestOptions) {
        const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SECONDARY_AUDIO, options);

        const settings: TSecondaryAudioSettings = {
            type: res.type ?? 'NONE',
            streamName: res.stream_name,
            clipName: res.clip_name,
            storage: res.storage ?? 'SD_DISK',
            secondaryAudioLevel: res.secondary_audio_level ?? 1,
            masterAudioLevel: res.master_audio_level ?? 1,
        };

        return secondaryAudioSettingsSchema.parse(settings);
    }

    async getPermanentRtspUrlToken(options?: THttpRequestOptions) {
        const paramName = CSW_PARAM_NAMES.RTSP_TOKEN;
        const res = await this.vapixAgent.getParameter([paramName], options);
        return z.string().parse(res[paramName] ?? '');
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

    private async _post(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({ path, data, parameters, timeout: options?.timeout, headers });

        if (res.ok) {
            return await res.json();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    private setParamFromCameraJSON(paramName: string, data: any, options?: THttpRequestOptions) {
        const params: Record<string, string> = {};
        params[paramName] = JSON.stringify(data);
        return this.vapixAgent.setParameter(params, options);
    }

    private async getParamFromCameraAndJSONParse(paramName: string, options?: THttpRequestOptions) {
        const data = await this.vapixAgent.getParameter([paramName], options);
        if (data[paramName] !== undefined) {
            // Check if requested parametr exists
            try {
                if (data[paramName] === '') {
                    return {};
                } else {
                    return JSON.parse(data[paramName] + '');
                }
            } catch {
                throw new JsonParseError(paramName, data[paramName]);
            }
        }

        throw new ParameterNotFoundError(paramName);
    }
}

const CSW_PARAM_NAMES = {
    SETTINGS: 'Camswitcher.Settings',
    MASTER_AUDIO: 'Camswitcher.MasterAudio',
    SECONDARY_AUDIO: 'Camswitcher.SecondaryAudio',
    RTSP_TOKEN: 'Camswitcher.RTSPAccessToken',
    DEFAULT_PLAYLIST: 'Camswitcher.DefaultPlaylist',
};
