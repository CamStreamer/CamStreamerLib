import { DefaultAgent } from './DefaultAgent';
import { AddNewClipError } from './errors/errors';
import { IClient, isClient, responseStringify } from './internal/common';
import {
    CamSwitcherAPIOptions,
    TApiClipType,
    TAudioPushInfo,
    TAvailableCameraList,
    TClipList,
    TClipStorage,
    TOutputInfo,
    TPlaylistList,
    TPlaylistQueue,
    TSilenceChannel,
    TTrackerList,
    TStreamList,
    TStorageInfoList,
    availableCameraListSchema,
    storageInfoListSchema,
    outputInfoSchema,
    audioPushInfoSchema,
    trackerListSchema,
    clipListSchema,
    playlistQueueSchema,
    playlistListSchema,
    streamListSchema,
} from './types/CamSwitcherAPI';

export class CamSwitcherAPI {
    private client: IClient;

    constructor(options: CamSwitcherAPIOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    generateSilence(sampleRate: number, channels: TSilenceChannel): Promise<void> {
        return this.get('/local/camswitcher/api/generate_silence.cgi', {
            sample_rate: sampleRate.toString(),
            channels,
        });
    }

    async checkCameraTime(): Promise<boolean> {
        return (await this.get('/local/camswitcher/api/camera_time.cgi')).data;
    }

    async getIpListFromNetworkCheck(): Promise<TAvailableCameraList> {
        const data = (await this.get('/local/camswitcher/api/network_camera_list.cgi')).data;
        return availableCameraListSchema.parse(data);
    }

    async getMaxFps(source: number): Promise<number> {
        return (await this.get('/local/camswitcher/api/get_max_framerate.cgi', { video_source: source.toString() }))
            .data;
    }

    async getStorageInfo(): Promise<TStorageInfoList> {
        const data = (await this.get('/local/camswitcher/api/get_storage.cgi')).data;
        return storageInfoListSchema.parse(data);
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    async wsAutoratization(): Promise<string> {
        return await this.get(`/local/camswitcher/api/ws_authorization.cgi`);
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
    //                 Playlists
    //   ----------------------------------------

    async getPlaylistList(): Promise<TPlaylistList> {
        const data = await this.get('/local/camswitcher/api/playlists.cgi?action=get');
        return playlistListSchema.parse(data);
    }
    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/api/playlist_switch.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/api/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueueClear(): Promise<void> {
        await this.get('/local/camswitcher/api/playlist_queue_clear.cgi');
    }
    async playlistQueueList(): Promise<TPlaylistQueue> {
        const data = await this.get('/local/camswitcher/api/playlist_queue_list.cgi');
        return playlistQueueSchema.parse(data);
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get('/local/camswitcher/api/playlist_queue_play_next.cgi');
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    async getClipList(): Promise<TClipList> {
        const data = await this.get('/local/camswitcher/api/clips.cgi?action=get');
        return clipListSchema.parse(data);
    }

    async addNewClip(
        file: Buffer,
        clipType: TApiClipType,
        storage: TClipStorage,
        id: string,
        fileName: string
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

    removeClip(id: string, storage: TClipStorage): Promise<{}> {
        return this.get(`/local/camswitcher/api/clip_remove.cgi`, { clip_name: id, storage });
    }

    getClipPreview(id: string, storage: TClipStorage): Promise<string> {
        return Promise.resolve(this.get(`/local/camswitcher/api/clip_preview.cgi`, { clip_name: id, storage }));
    }

    //   ----------------------------------------
    //                   Other sources
    //   ----------------------------------------

    async getStreamList(): Promise<TStreamList> {
        const data = await this.get('/local/camswitcher/api/streams.cgi?action=get');
        return streamListSchema.parse(data);
    }

    async getTrackerList(): Promise<TTrackerList> {
        const data = await this.get('/local/camswitcher/api/trackers.cgi?action=get');
        return trackerListSchema.parse(data);
    }

    private async get(path: string, parameters: Record<string, string> = {}): Promise<any> {
        const res = await this.client.get(path, parameters);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
