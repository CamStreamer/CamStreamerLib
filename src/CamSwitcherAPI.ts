import { z } from 'zod';
import { AddNewClipError } from './errors/errors';
import { IClient, responseStringify } from './internal/common';
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
} from './types/CamSwitcherAPI';
import { networkCameraListSchema, TAudioChannel, TNetworkCamera, TStorageType } from './types/common';

export class CamSwitcherAPI {
    baseUrl = '/local/camswitcher/api';

    constructor(public client: IClient) {}

    getProxyUrl = () => `${this.client.url}${this.baseUrl}/proxy.cgi`;
    getWsEventsUrl = () => `${this.client.url}/local/camswitcher/events`;
    getClipPreview = (id: string, storage: TStorageType) =>
        `${this.client.url}${this.baseUrl}/clip_preview.cgi?clip_name=${id}&storage=${storage}`;

    async generateSilence(sampleRate: number, channels: TAudioChannel) {
        await this.client.get(`${this.baseUrl}/generate_silence.cgi`, {
            sample_rate: sampleRate.toString(),
            channels,
        });
    }

    async checkCameraTime(): Promise<boolean> {
        const data = await this.get(`${this.baseUrl}/camera_time.cgi`);
        return z.boolean().parse(data);
    }

    async getIpListFromNetworkCheck(): Promise<TNetworkCamera[]> {
        const data = await this.get(`${this.baseUrl}/network_camera_list.cgi`);
        return networkCameraListSchema.parse(data);
    }

    async getMaxFps(source: number): Promise<number> {
        const data = await this.get(`${this.baseUrl}/get_max_framerate.cgi`, {
            video_source: source.toString(),
        });
        return z.number().parse(data);
    }

    async getStorageInfo(): Promise<TStorageInfo[]> {
        const data = await this.get(`${this.baseUrl}/get_storage.cgi`);
        return storageInfoListSchema.parse(data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAutoratization(): Promise<string> {
        const data = await this.get(`${this.baseUrl}/ws_authorization.cgi`);
        return z.string().parse(data);
    }

    async getOutputInfo(): Promise<TOutputInfo> {
        const data = await this.get(`${this.baseUrl}/output_info.cgi`);
        return outputInfoSchema.parse(data);
    }

    async getAudioPushInfo(): Promise<TAudioPushInfo> {
        const data = await this.get(`${this.baseUrl}/audio_push_info.cgi`);
        return audioPushInfoSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Sources
    //   ----------------------------------------

    async getStreamSaveList(): Promise<TStreamSaveLoadList> {
        const data = await this.get(`${this.baseUrl}/streams.cgi`, { action: 'get' });
        return streamSaveLoadSchema.parse(data);
    }

    async getClipSaveList(): Promise<TClipSaveLoadList> {
        const data = await this.get(`${this.baseUrl}/clips.cgi`, { action: 'get' });
        return clipSaveLoadSchema.parse(data);
    }

    async getPlaylistSaveList(): Promise<TPlaylistSaveLoadList> {
        const data = await this.get(`${this.baseUrl}/playlists.cgi`, { action: 'get' });
        return playlistSaveLoadSchema.parse(data);
    }

    async getTrackerSaveList(): Promise<TrackerSaveLoadList> {
        const data = await this.get(`${this.baseUrl}/trackers.cgi`, { action: 'get' });
        return trackerSaveLoadSchema.parse(data);
    }

    async setStreamSaveList(data: TStreamSaveList) {
        return await this.set(`${this.baseUrl}/streams.cgi`, data, { action: 'set' });
    }

    async setClipSaveList(data: TClipSaveList) {
        return await this.set(`${this.baseUrl}/clips.cgi`, data, { action: 'set' });
    }

    async setPlaylistSaveList(data: TPlaylistSaveList) {
        return await this.set(`${this.baseUrl}/playlists.cgi`, data, { action: 'set' });
    }

    async setTrackerSaveList(data: TTrackerSaveList) {
        return await this.set(`${this.baseUrl}/trackers.cgi`, data, { action: 'set' });
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`${this.baseUrl}/playlist_switch.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`${this.baseUrl}/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueueClear(): Promise<void> {
        await this.get(`${this.baseUrl}/playlist_queue_clear.cgi`);
    }
    async playlistQueueList() {
        const data = await this.get(`${this.baseUrl}/playlist_queue_list.cgi`);
        return playlistQueueSchema.parse(data).playlistQueueList;
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get(`${this.baseUrl}/playlist_queue_play_next.cgi`);
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

        const path = `${this.baseUrl}/clip_upload.cgi?storage=${storage}`;

        const res = await this.client.post(path, formData);
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new AddNewClipError(output.message);
        }
    }

    removeClip(id: string, storage: TStorageType): Promise<{}> {
        return this.get(`${this.baseUrl}/clip_remove.cgi`, { clip_name: id, storage });
    }

    async getClipList(): Promise<TClipList> {
        const data = await this.get(`${this.baseUrl}/clip_list.cgi`);
        return clipListSchema.parse(data).clip_list;
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
            const parsed = (await res.json()) as any;
            return parsed.message === 'OK';
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
