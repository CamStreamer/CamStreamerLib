import { z } from 'zod';
import { DefaultAgent } from './DefaultAgent';
import { AddNewClipError } from './errors/errors';
import { IClient, isClient, responseStringify } from './internal/common';
import {
    CamSwitcherAPIOptions,
    TAudioPushInfo,
    TOutputInfo,
    availableCameraListSchema,
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
import { TAudioChannel, TNetworkCamera, TStorageType } from './types/common';

export class CamSwitcherAPI {
    private client: IClient;

    constructor(options: CamSwitcherAPIOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    getProxyUrl = () => '/local/camswitcher/api/proxy.cgi';

    async generateSilence(sampleRate: number, channels: TAudioChannel) {
        await this.client.get('/local/camswitcher/api/generate_silence.cgi', {
            sample_rate: sampleRate.toString(),
            channels,
        });
    }

    async checkCameraTime(): Promise<boolean> {
        const data = await this.get('/local/camswitcher/api/camera_time.cgi');
        return z.boolean().parse(data);
    }

    async getIpListFromNetworkCheck(): Promise<TNetworkCamera[]> {
        const data = (await this.get('/local/camswitcher/api/network_camera_list.cgi')).data;
        return availableCameraListSchema.parse(data).camera_list;
    }

    async getMaxFps(source: number): Promise<number> {
        const data = await this.get('/local/camswitcher/api/get_max_framerate.cgi', {
            video_source: source.toString(),
        });
        return z.number().parse(data);
    }

    async getStorageInfo(): Promise<TStorageInfo[]> {
        const data = (await this.get('/local/camswitcher/api/get_storage.cgi')).data;
        return storageInfoListSchema.parse(data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAutoratization(): Promise<string> {
        const data = await this.get(`/local/camswitcher/api/ws_authorization.cgi`);
        return z.string().parse(data);
    }

    async getOutputInfo(): Promise<TOutputInfo> {
        const data = await this.get('/local/camswitcher/api/output_info.cgi');
        return outputInfoSchema.parse(data);
    }

    async getAudioPushInfo(): Promise<TAudioPushInfo> {
        const data = await this.get(`/local/camswitcher/api/audio_push_info.cgi`);
        return audioPushInfoSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Sources
    //   ----------------------------------------

    async getStreamSaveList(): Promise<TStreamSaveLoadList> {
        const data = await this.get('/local/camswitcher/api/streams.cgi', { action: 'get' });
        return streamSaveLoadSchema.parse(data);
    }

    async getClipSaveList(): Promise<TClipSaveLoadList> {
        const data = await this.get('/local/camswitcher/api/clips.cgi', { action: 'get' });
        return clipSaveLoadSchema.parse(data.clip_list);
    }

    async getPlaylistSaveList(): Promise<TPlaylistSaveLoadList> {
        const data = await this.get('/local/camswitcher/api/playlists.cgi', { action: 'get' });
        return playlistSaveLoadSchema.parse(data);
    }

    async getTrackerSaveList(): Promise<TrackerSaveLoadList> {
        const data = await this.get('/local/camswitcher/api/trackers.cgi', { action: 'get' });
        return trackerSaveLoadSchema.parse(data);
    }

    async setStreamSaveList(data: TStreamSaveList) {
        return await this.set('/local/camswitcher/api/streams.cgi', data, { action: 'set' });
    }

    async setClipSaveList(data: TClipSaveList) {
        return await this.set('/local/camswitcher/api/clips.cgi', data, { action: 'set' });
    }

    async setPlaylistSaveList(data: TPlaylistSaveList) {
        return await this.set('/local/camswitcher/api/playlists.cgi', data, { action: 'set' });
    }

    async setTrackerSaveList(data: TTrackerSaveList) {
        return await this.set('/local/camswitcher/api/trackers.cgi', data, { action: 'set' });
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/api/playlist_switch.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/api/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueueClear(): Promise<void> {
        await this.get('/local/camswitcher/api/playlist_queue_clear.cgi');
    }
    async playlistQueueList() {
        const data = await this.get('/local/camswitcher/api/playlist_queue_list.cgi');
        return playlistQueueSchema.parse(data).playlistQueueList;
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get('/local/camswitcher/api/playlist_queue_play_next.cgi');
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

        const path = `/local/camswitcher/api/clip_upload.cgi?storage=${storage}`;

        const res = await this.client.post(path, formData);
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new AddNewClipError(output.message);
        }
    }

    removeClip(id: string, storage: TStorageType): Promise<{}> {
        return this.get(`/local/camswitcher/api/clip_remove.cgi`, { clip_name: id, storage });
    }

    getClipPreview(id: string, storage: TStorageType): Promise<string> {
        return Promise.resolve(this.get(`/local/camswitcher/api/clip_preview.cgi`, { clip_name: id, storage }));
    }

    async getClipList(): Promise<TClipList> {
        const data = await this.get('/clip_list.cgi');
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
