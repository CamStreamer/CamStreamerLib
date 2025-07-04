import { z } from 'zod';
import { AddNewClipError } from './errors/errors';
import { IClient, isNullish, responseStringify } from './internal/common';
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
import { networkCameraListSchema, TAudioChannel, TNetworkCamera, TStorageType } from './types/common';
import { VapixAPI } from './VapixAPI';
import { isFirmwareVersionAtLeast } from './internal/versionCompare';
import { isClip } from './internal/utils';

const baseUrl = '/local/camswitcher/api';

export class CamSwitcherAPI {
    private vapixAgent: VapixAPI;

    constructor(public client: IClient) {
        this.vapixAgent = new VapixAPI(client, () => '');
    }

    static getProxyUrl = () => `${baseUrl}/proxy.cgi`;
    static getWsEventsUrl = () => `/local/camswitcher/events`;
    static getClipPreview = (id: string, storage: TStorageType) =>
        `${baseUrl}/clip_preview.cgi?clip_name=${id}&storage=${storage}`;

    async generateSilence(sampleRate: number, channels: TAudioChannel) {
        await this.client.get(`${baseUrl}/generate_silence.cgi`, {
            sample_rate: sampleRate.toString(),
            channels,
        });
    }

    async checkCameraTime(): Promise<boolean> {
        const data = await this.get(`${baseUrl}/camera_time.cgi`);
        return z.boolean().parse(data);
    }

    async getIpListFromNetworkCheck(): Promise<TNetworkCamera[]> {
        const data = await this.get(`${baseUrl}/network_camera_list.cgi`);
        return networkCameraListSchema.parse(data);
    }

    async getMaxFps(source: number): Promise<number> {
        const data = await this.get(`${baseUrl}/get_max_framerate.cgi`, {
            video_source: source.toString(),
        });
        return z.number().parse(data);
    }

    async getStorageInfo(): Promise<TStorageInfo[]> {
        const data = await this.get(`${baseUrl}/get_storage.cgi`);
        return storageInfoListSchema.parse(data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAuthorization(): Promise<string> {
        const data = await this.get(`${baseUrl}/ws_authorization.cgi`);
        return z.string().parse(data);
    }

    async getOutputInfo(): Promise<TOutputInfo> {
        const data = await this.get(`${baseUrl}/output_info.cgi`);
        return outputInfoSchema.parse(data);
    }

    async getAudioPushInfo(): Promise<TAudioPushInfo> {
        const data = await this.get(`${baseUrl}/audio_push_info.cgi`);
        return audioPushInfoSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Sources
    //   ----------------------------------------

    async getStreamSaveList(): Promise<TStreamSaveLoadList> {
        const data = await this.get(`${baseUrl}/streams.cgi`, { action: 'get' });
        return streamSaveLoadSchema.parse(data);
    }

    async getClipSaveList(): Promise<TClipSaveLoadList> {
        const data = await this.get(`${baseUrl}/clips.cgi`, { action: 'get' });
        return clipSaveLoadSchema.parse(data);
    }

    async getPlaylistSaveList(): Promise<TPlaylistSaveLoadList> {
        const data = await this.get(`${baseUrl}/playlists.cgi`, { action: 'get' });
        return playlistSaveLoadSchema.parse(data);
    }

    async getTrackerSaveList(): Promise<TrackerSaveLoadList> {
        const data = await this.get(`${baseUrl}/trackers.cgi`, { action: 'get' });
        return trackerSaveLoadSchema.parse(data);
    }

    async setStreamSaveList(data: TStreamSaveList) {
        return await this.set(`${baseUrl}/streams.cgi`, data, { action: 'set' });
    }

    async setClipSaveList(data: TClipSaveList) {
        return await this.set(`${baseUrl}/clips.cgi`, data, { action: 'set' });
    }

    async setPlaylistSaveList(data: TPlaylistSaveList) {
        return await this.set(`${baseUrl}/playlists.cgi`, data, { action: 'set' });
    }

    async setTrackerSaveList(data: TTrackerSaveList) {
        return await this.set(`${baseUrl}/trackers.cgi`, data, { action: 'set' });
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`${baseUrl}/playlist_switch.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`${baseUrl}/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueueClear(): Promise<void> {
        await this.get(`${baseUrl}/playlist_queue_clear.cgi`);
    }
    async playlistQueueList() {
        const data = await this.get(`${baseUrl}/playlist_queue_list.cgi`);
        return playlistQueueSchema.parse(data).playlistQueueList;
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get(`${baseUrl}/playlist_queue_play_next.cgi`);
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    async addNewClip(
        file: any, // Buffer | File
        clipType: 'video' | 'audio',
        storage: TStorageType,
        id: string,
        fileName?: string
    ): Promise<void> {
        const formData = new FormData();
        formData.append('clip_name', id);
        formData.append('clip_type', clipType);
        formData.append('file', file, fileName);

        const path = `${baseUrl}/clip_upload.cgi?storage=${storage}`;

        const res = await this.client.post(path, formData);
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new AddNewClipError(output.message);
        }
    }

    removeClip(id: string, storage: TStorageType): Promise<{}> {
        return this.get(`${baseUrl}/clip_remove.cgi`, { clip_name: id, storage });
    }

    async getClipList(): Promise<TClipList> {
        const data = await this.get(`${baseUrl}/clip_list.cgi`);
        return clipListSchema.parse(data).clip_list;
    }

    //   ----------------------------------------
    //               Configuration
    //   ----------------------------------------

    //* ******************   Set

    setCamSwitchOptions(data: TCameraOptions, cameraFWVersion: string): Promise<boolean> {
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

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SETTINGS, saveData);
    }

    setGlobalAudioSettings(settings: TGlobalAudioSettings) {
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

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.MASTER_AUDIO, data);
    }

    setSecondaryAudioSettings(settings: TSecondaryAudioSettings) {
        const data = {
            type: settings.type,
            stream_name: settings.streamName ?? '',
            clip_name: settings.clipName ?? '',
            storage: settings.storage,
            secondary_audio_level: settings.secondaryAudioLevel,
            master_audio_level: settings.masterAudioLevel,
        };

        return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SECONDARY_AUDIO, data);
    }

    setDefaultPlaylist(id: string) {
        const value = JSON.stringify({ default_playlist_id: id });
        return this.vapixAgent.setParameter(
            {
                [CSW_PARAM_NAMES.DEFAULT_PLAYLIST]: value,
            },
            null
        );
    }

    setPermanentRtspUrlToken(token: string) {
        return this.vapixAgent.setParameter({ [CSW_PARAM_NAMES.RTSP_TOKEN]: token }, null);
    }

    //* ******************   Get

    async getCamSwitchOptions(): Promise<Partial<TCameraOptions>> {
        const saveData = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SETTINGS);

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

    async getGlobalAudioSettings(): Promise<TGlobalAudioSettings> {
        const settings: TGlobalAudioSettings = {
            type: 'fromSource',
            source: 'fromSource',
        };

        const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.MASTER_AUDIO);
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

    async getSecondaryAudioSettings(): Promise<TSecondaryAudioSettings> {
        const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SECONDARY_AUDIO);

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

    async getPermanentRtspUrlToken() {
        const paramName = CSW_PARAM_NAMES.RTSP_TOKEN;
        const res = await this.vapixAgent.getParameter([paramName], null);
        return res[paramName] ?? '';
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async get(path: string, parameters: Record<string, string> = {}) {
        const res = await this.client.get(path, parameters);

        if (res.ok) {
            const d = (await res.json()) as any;
            return d.data;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async set(path: string, data: any, parameters: Record<string, string> = {}) {
        const res = await this.client.post(path, JSON.stringify(data), parameters);

        if (res.ok) {
            const parsed = await res.json();
            return parsed.message === 'OK';
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private setParamFromCameraJSON(paramName: string, data: any): Promise<boolean> {
        const params: Record<string, string> = {};
        params[paramName] = JSON.stringify(data);
        return this.vapixAgent.setParameter(params, null);
    }

    private async getParamFromCameraAndJSONParse(paramName: string): Promise<any> {
        const data = await this.vapixAgent.getParameter([paramName], null);
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
}

const CSW_PARAM_NAMES = {
    SETTINGS: 'Camswitcher.Settings',
    MASTER_AUDIO: 'Camswitcher.MasterAudio',
    SECONDARY_AUDIO: 'Camswitcher.SecondaryAudio',
    RTSP_TOKEN: 'Camswitcher.RTSPAccessToken',
    DEFAULT_PLAYLIST: 'Camswitcher.DefaultPlaylist',
};
const FIRMWARE_WITH_BITRATE_MODES_SUPPORT = '11.11.73';

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

    if (bitrateMode === 'VBR') {
        return 'videobitratemode=vbr';
    }

    if (bitrateMode === 'MBR') {
        return `videobitratemode=mbr&videomaxbitrate=${cameraOptions.maximumBitRate}`;
    }

    if (bitrateMode === 'ABR') {
        return `videobitratemode=abr&videoabrtargetbitrate=${cameraOptions.maximumBitRate}&videoabrretentiontime=${cameraOptions.retentionTime}&videoabrmaxbitrate=${cameraOptions.bitRateLimit}`;
    }

    throw new Error('Unknown bitrateMode param in getVapixParams method.');
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
        const maximumBitRate = parseInt(params['videomaxbitrate'], 10);
        return {
            bitrateMode: 'MBR',
            maximumBitRate: maximumBitRate,
            retentionTime: 1,
            bitRateLimit: Math.floor(maximumBitRate * 1.1),
        };
    }

    if (bitrateMode === 'ABR') {
        const maximumBitRate = parseInt(params['videoabrtargetbitrate'], 10);
        const retentionTime = parseInt(params['videoabrretentiontime'], 10);
        const bitrateLimit = parseInt(params['videoabrmaxbitrate'], 10);

        return {
            bitrateMode: bitrateMode,
            maximumBitRate: maximumBitRate,
            retentionTime: retentionTime,
            bitRateLimit: bitrateLimit,
        };
    } else if (bitrateMode === 'MBR') {
        const maximumBitRate = parseInt(params['videomaxbitrate'], 10);
        const oldMaximumBitrateParamValue = parseInt(params['videombrmaxbitrate'], 10);

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
