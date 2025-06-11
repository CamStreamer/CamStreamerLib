import { DefaultAgent } from './DefaultAgent';
import { HttpOptions, IClient, isClient, responseStringify, TKeyboardShortcuts } from './internal/common';

export type CamSwitcherAPIOptions = HttpOptions;

export type TStreamInfo = {
    id: string;
    isTimeoutCustom: boolean;
    ptz_preset_pos_name: string;
    repeat: number;
    timeout: number;
    video: Record<string, string>;
    audio: Record<string, string>;
};
export type TPlaylistInfo = {
    channel: TChannelType;
    isFavourite: false;
    keyboard: object;
    loop: boolean;
    niceName: string;
    sortIndexFavourite: number;
    sortIndexOverview: number;
    stream_list: TStreamInfo[];
};
export type TPlaylistList = Record<string, TPlaylistInfo>;
export type TPlaylistQueue = {
    playlist_queue_list: string[];
};

export type TClipInfo = {
    niceName: string;
    channel: TChannelType;
    keyboard: object;
    sortIndexOverview: number;
};
export type TClipList = Record<string, TClipInfo>;
export type TApiClipType = 'audio' | 'video';
export type TClipStorage = 'SD_DISK' | 'FLASH';

export type TTrackerCameraListItem = {
    id: string;
    name: string;
    overview: boolean;
    zone: number[]; // 4
    playlist_name: string;
    ptz_preset_pos_no: number;
};
export type TTrackerInfo = {
    id: string;
    name: string;
    previewId: string;
    status: {
        video: string;
        audio: string;
    };
    duration: number;
    keyboard: TKeyboardShortcuts;
    channel: TChannelType;
    sortIndexOverview: number;
    width: number;
    height: number;
    fps: number;
    motion_history_frames: number;
    include_zone: number[][]; // 2[]
    include_node_ids: string[];
    camera_list: TTrackerCameraListItem[];
    viewNumber: number;
    camera_view_number: number;
};
export type TTrackerList = Record<string, TTrackerInfo>;

export type TStreamSourceInfo = {
    niceName: string;
    ip: string;
    mdnsName: string;
    port: number;
    enabled: boolean;
    auth: string;
    query: string;
    channel: TChannelType;
    keyboard: TKeyboardShortcuts;
    sortIndexOverview: number;
    viewNumber: number;
};
export type TStreamList = Record<string, TStreamSourceInfo>;

export type TOutputInfo = {
    rtsp_url: string;
    ws: string;
    ws_initial_message: string;
};
export type TAudioPushInfo = {
    ws: string;
    ws_initial_message: string;
};

export type TChannelType = 'audio' | 'video' | 'av';

export type TSilenceChannel = 'mono' | 'stereo';
export type TAvailableCameraList = { camera_list: { name: string; ip: string }[] };
export type TStorageInfo = {
    storage: TClipStorage;
    writable: boolean;
    size: number;
    available: number;
};

const cgiNames = {
    camera: 'streams',
    audio: 'audios',
    playlist: 'playlists',
    clip: 'clips',
    tracker: 'trackers',
};
export type TSourceType = keyof typeof cgiNames;

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
        return (await this.get('/local/camswitcher/api/network_camera_list.cgi')).data;
    }

    async getMaxFps(source: number): Promise<number> {
        return (await this.get('/local/camswitcher/api/get_max_framerate.cgi', { video_source: source.toString() }))
            .data;
    }

    async getStorageInfo(): Promise<TStorageInfo[]> {
        return (await this.get('/local/camswitcher/api/get_storage.cgi')).data;
    }

    //   ----------------------------------------
    //                 Websockets
    //   ----------------------------------------

    wsAutoratization(): Promise<string> {
        return this.get(`/local/camswitcher/api/ws_authorization.cgi`);
    }

    async getOutputInfo(): Promise<TOutputInfo> {
        return (await this.get('/local/camswitcher/api/output_info.cgi')).data;
    }

    async getAudioPushInfo(): Promise<TAudioPushInfo> {
        return (await this.get(`/local/camswitcher/api/audio_push_info.cgi`)).data;
    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    getPlaylistList(): Promise<TPlaylistList> {
        return this.get('/local/camswitcher/api/playlists.cgi?action=get');
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
    playlistQueueList(): Promise<TPlaylistQueue> {
        return this.get('/local/camswitcher/api/playlist_queue_list.cgi');
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get('/local/camswitcher/api/playlist_queue_play_next.cgi');
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    getClipList(): Promise<TClipList> {
        return this.get('/local/camswitcher/api/clips.cgi?action=get');
    }

    async addNewClip(file: Buffer, clipType: TApiClipType, storage: TClipStorage, id: string, fileName: string) {
        const formData = new FormData();
        formData.append('clip_name', id);
        formData.append('clip_type', clipType);
        formData.append('file', file, fileName);

        const path = `/local/camswitcher/api/clip_upload.cgi?storage=${storage}`;

        const res = await this.client.post(path, formData);
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new Error('Error on camera: ' + output.message);
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

    getStreamList(): Promise<TStreamList> {
        return this.get('/local/camswitcher/api/streams.cgi?action=get');
    }

    getTrackerList(): Promise<TTrackerList> {
        return this.get('/local/camswitcher/api/trackers.cgi?action=get');
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
