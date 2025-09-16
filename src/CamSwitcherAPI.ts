import { z } from 'zod';
import { AddNewClipError } from './errors/errors';
import { IClient, TResponse } from './internal/types';
import { isClip, isNullish, responseStringify } from './internal/utils';
import {
    TAudioPushInfo,
    TOutputInfo,
    storageInfoListSchema,
    outputInfoSchema,
    audioPushInfoSchema,
    clipListSchema,
    playlistQueueSchema,
    TStorageInfo,
    TStreamSaveList,
    TClipList,
    TStreamSaveLoadList,
    streamSaveLoadSchema,
    TClipSaveLoadList,
    clipSaveLoadSchema,
    TPlaylistSaveLoadList,
    playlistSaveLoadSchema,
    trackerSaveLoadSchema,
    TTrackerSaveList,
    TrackerSaveLoadList,
    TClipSaveList,
    TPlaylistSaveList,
    TCameraOptions,
    TBitrateMode,
    TBitrateVapixParams,
    TGlobalAudioSettings,
    TSecondaryAudioSettings,
} from './types/CamSwitcherAPI';
import {
    networkCameraListSchema,
    TAudioChannel,
    THttpRequestOptions,
    TNetworkCamera,
    TProxyParams,
    TStorageType,
} from './types/common';
import { VapixAPI } from './VapixAPI';
import { isFirmwareVersionAtLeast } from './internal/versionCompare';
import { FIRMWARE_WITH_BITRATE_MODES_SUPPORT } from './internal/constants';
import { ProxyClient } from './internal/ProxyClient';

const BASE_PATH = '/local/camswitcher/api';

export class CamSwitcherAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    private vapixAgent: VapixAPI;

    constructor(public client: Client, private CustomFormData = FormData) {
        this.vapixAgent = new VapixAPI(client);
    }

    static getProxyUrlPath = () => `${BASE_PATH}/proxy.cgi`;
    static getWsEventsUrlPath = () => `/local/camswitcher/events`;
    static getClipPreviewUrlPath = (id: string, storage: TStorageType) =>
        `${BASE_PATH}/clip_preview.cgi?clip_name=${id}&storage=${storage}`;

    async generateSilence(sampleRate: number, channels: TAudioChannel, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        await agent.get({
            path: `${BASE_PATH}/generate_silence.cgi`,
            parameters: {
                sample_rate: sampleRate.toString(),
                channels,
            },
            timeout: options?.timeout,
        });
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(data);
    }

    async getNetworkCameraList(options?: THttpRequestOptions): Promise<TNetworkCamera[]> {
        const data = await this.get(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(data);
    }

    async getMaxFps(source: number, options?: THttpRequestOptions): Promise<number> {
        const data = await this.get(
            `${BASE_PATH}/get_max_framerate.cgi`,
            {
                video_source: source.toString(),
            },
            options
        );
        return z.number().parse(data);
    }

    async getStorageInfo(options?: THttpRequestOptions): Promise<TStorageInfo[]> {
        const data = await this.get(`${BASE_PATH}/get_storage.cgi`, undefined, options);
        return storageInfoListSchema.parse(data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAuthorization(options?: THttpRequestOptions): Promise<string> {
        const data = await this.get(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        return z.string().parse(data);
    }

    async getOutputInfo(options?: THttpRequestOptions): Promise<TOutputInfo> {
        const data = await this.get(`${BASE_PATH}/output_info.cgi`, undefined, options);
        return outputInfoSchema.parse(data);
    }

    async getAudioPushInfo(options?: THttpRequestOptions): Promise<TAudioPushInfo> {
        const data = await this.get(`${BASE_PATH}/audio_push_info.cgi`, undefined, options);
        return audioPushInfoSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Sources
    //   ----------------------------------------

    async getStreamSaveList(options?: THttpRequestOptions): Promise<TStreamSaveLoadList> {
        const data = await this.get(`${BASE_PATH}/streams.cgi`, { action: 'get' }, options);
        return streamSaveLoadSchema.parse(data);
    }

    async getClipSaveList(options?: THttpRequestOptions): Promise<TClipSaveLoadList> {
        const data = await this.get(`${BASE_PATH}/clips.cgi`, { action: 'get' }, options);
        return clipSaveLoadSchema.parse(data);
    }

    async getPlaylistSaveList(options?: THttpRequestOptions): Promise<TPlaylistSaveLoadList> {
        const data = await this.get(`${BASE_PATH}/playlists.cgi`, { action: 'get' }, options);
        return playlistSaveLoadSchema.parse(data);
    }

    async getTrackerSaveList(options?: THttpRequestOptions): Promise<TrackerSaveLoadList> {
        const data = await this.get(`${BASE_PATH}/trackers.cgi`, { action: 'get' }, options);
        return trackerSaveLoadSchema.parse(data);
    }

    async setStreamSaveList(data: TStreamSaveList, options?: THttpRequestOptions) {
        return await this.set(`${BASE_PATH}/streams.cgi`, data, { action: 'set' }, options);
    }

    async setClipSaveList(data: TClipSaveList, options?: THttpRequestOptions) {
        return await this.set(`${BASE_PATH}/clips.cgi`, data, { action: 'set' }, options);
    }

    async setPlaylistSaveList(data: TPlaylistSaveList, options?: THttpRequestOptions) {
        return await this.set(`${BASE_PATH}/playlists.cgi`, data, { action: 'set' }, options);
    }

    async setTrackerSaveList(data: TTrackerSaveList, options?: THttpRequestOptions) {
        return await this.set(`${BASE_PATH}/trackers.cgi`, data, { action: 'set' }, options);
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    async playlistSwitch(playlistName: string, options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/playlist_switch.cgi`, { playlist_name: playlistName }, options);
    }
    async playlistQueuePush(playlistName: string, options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/playlist_queue_push.cgi`, { playlist_name: playlistName }, options);
    }
    async playlistQueueClear(options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/playlist_queue_clear.cgi`, undefined, options);
    }
    async playlistQueueList(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/playlist_queue_list.cgi`, undefined, options);
        return playlistQueueSchema.parse(data).playlistQueueList;
    }
    async playlistQueuePlayNext(options?: THttpRequestOptions) {
        await this.get(`${BASE_PATH}/playlist_queue_play_next.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    async addNewClip(
        file: any, // Buffer | File
        clipType: 'video' | 'audio',
        storage: TStorageType,
        id: string,
        fileName?: string,
        options?: THttpRequestOptions
    ) {
        const path = `${BASE_PATH}/clip_upload.cgi?storage=${storage}`;

        const formData = new this.CustomFormData();
        formData.append('clip_name', id);
        formData.append('clip_type', clipType);
        formData.append('file', file, fileName);

        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({ path, data: formData, timeout: options?.timeout });
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new AddNewClipError(output.message);
        }
    }

    removeClip(id: string, storage: TStorageType, options?: THttpRequestOptions) {
        return this.get(`${BASE_PATH}/clip_remove.cgi`, { clip_name: id, storage }, options);
    }

    async getClipList(options?: THttpRequestOptions): Promise<TClipList> {
        const data = await this.get(`${BASE_PATH}/clip_list.cgi`, undefined, options);
        return clipListSchema.parse(data).clip_list;
    }

    //   ----------------------------------------
    //               Configuration
    //   ----------------------------------------

    //* ******************   Set

    setCamSwitchOptions(data: TCameraOptions, cameraFWVersion: string, options?: THttpRequestOptions) {
        const bitrateVapixParams = parseBitrateOptionsToBitrateVapixParams(cameraFWVersion, data.bitrateMode, data);
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

    setDefaultPlaylist(id: string, options?: THttpRequestOptions) {
        const value = JSON.stringify({ default_playlist_id: id });
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

    async getCamSwitchOptions(options?: THttpRequestOptions): Promise<Partial<TCameraOptions>> {
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

    async getGlobalAudioSettings(options?: THttpRequestOptions): Promise<TGlobalAudioSettings> {
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

        return settings;
    }

    async getSecondaryAudioSettings(options?: THttpRequestOptions): Promise<TSecondaryAudioSettings> {
        const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SECONDARY_AUDIO, options);

        const settings = {
            type: res.type ?? 'NONE',
            streamName: res.stream_name,
            clipName: res.clip_name,
            storage: res.storage,
            secondaryAudioLevel: res.secondary_audio_level ?? 1,
            masterAudioLevel: res.master_audio_level ?? 1,
        };

        return settings;
    }

    async getPermanentRtspUrlToken(options?: THttpRequestOptions) {
        const paramName = CSW_PARAM_NAMES.RTSP_TOKEN;
        const res = await this.vapixAgent.getParameter([paramName], options);
        return res[paramName] ?? '';
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async get(path: string, parameters?: Record<string, string>, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            const d = (await res.json()) as any;
            return d.data;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async set(path: string, data: any, parameters?: Record<string, string>, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({ path, data: JSON.stringify(data), parameters, timeout: options?.timeout });

        if (res.ok) {
            const parsed = await res.json();
            return parsed.message === 'OK';
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private setParamFromCameraJSON(paramName: string, data: any, options?: THttpRequestOptions) {
        const params: Record<string, string> = {};
        params[paramName] = JSON.stringify(data);
        return this.vapixAgent.setParameter(params, options);
    }

    private async getParamFromCameraAndJSONParse(paramName: string, options?: THttpRequestOptions): Promise<any> {
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
                throw new Error('Error: in JSON parsing of ' + paramName + '. Cannot parse: ' + data[paramName]);
            }
        }

        throw new Error("Error: no parametr '" + paramName + "' was found");
    }

    private getAgent(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }
}

const CSW_PARAM_NAMES = {
    SETTINGS: 'Camswitcher.Settings',
    MASTER_AUDIO: 'Camswitcher.MasterAudio',
    SECONDARY_AUDIO: 'Camswitcher.SecondaryAudio',
    RTSP_TOKEN: 'Camswitcher.RTSPAccessToken',
    DEFAULT_PLAYLIST: 'Camswitcher.DefaultPlaylist',
};

const parseBitrateOptionsToBitrateVapixParams = (
    firmWareVersion: string,
    bitrateMode: TBitrateMode | null,
    cameraOptions: TCameraOptions
): string => {
    if (!isFirmwareVersionAtLeast(firmWareVersion, FIRMWARE_WITH_BITRATE_MODES_SUPPORT)) {
        return `videomaxbitrate=${cameraOptions.maximumBitRate}`;
    }

    if (bitrateMode === null) {
        return '';
    }

    const data: Record<TBitrateMode, string> = {
        VBR: 'videobitratemode=vbr',
        MBR: `videobitratemode=mbr&videomaxbitrate=${cameraOptions.maximumBitRate}`,
        ABR: `videobitratemode=abr&videoabrtargetbitrate=${cameraOptions.maximumBitRate}&videoabrretentiontime=${cameraOptions.retentionTime}&videoabrmaxbitrate=${cameraOptions.bitRateLimit}`,
    };

    return data[bitrateMode];
};

const parseVapixParamsToBitrateOptions = (bitrateVapixParams: string): TBitrateVapixParams => {
    const params: Record<string, string> = {};

    const searchParams = new URLSearchParams(bitrateVapixParams);
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    const bitrateMode = params['videobitratemode'] !== undefined ? params['videobitratemode'].toUpperCase() : undefined;

    // Lower firmware version does not support bitrate modes and has only videomaxbitrate param
    const hasLowerFw = bitrateMode === undefined && params['videomaxbitrate'] !== undefined;
    if (hasLowerFw) {
        const maximumBitRate = parseInt(params['videomaxbitrate'] ?? '0', 10);
        return {
            bitrateMode: 'MBR',
            maximumBitRate: maximumBitRate,
            retentionTime: 1,
            bitRateLimit: Math.floor(maximumBitRate * 1.1),
        };
    }

    if (bitrateMode === 'ABR') {
        const maximumBitRate = parseInt(params['videoabrtargetbitrate'] ?? '0', 10);
        const retentionTime = parseInt(params['videoabrretentiontime'] ?? '0', 10);
        const bitRateLimit = parseInt(params['videoabrmaxbitrate'] ?? '0', 10);

        return {
            bitrateMode,
            maximumBitRate,
            retentionTime,
            bitRateLimit,
        };
    } else if (bitrateMode === 'MBR') {
        const maximumBitRate = params['videomaxbitrate'] !== undefined ? parseInt(params['videomaxbitrate'], 10) : null;
        const oldMaximumBitrateParamValue = parseInt(params['videombrmaxbitrate'] ?? '0', 10);

        return {
            bitrateMode: bitrateMode,
            maximumBitRate: maximumBitRate ?? oldMaximumBitrateParamValue,
            retentionTime: 1,
            bitRateLimit: Math.floor(maximumBitRate ?? oldMaximumBitrateParamValue * 1.1),
        };
    }

    return {
        bitrateMode: bitrateMode as TBitrateMode,
        retentionTime: 1,
        maximumBitRate: 0,
        bitRateLimit: 0,
    };
};
