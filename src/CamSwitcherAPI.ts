import { DefaultAgent } from './DefaultAgent';
import { HttpOptions, IClient, isClient } from './internal/common';

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
    channel: string;
    isFavourite: false;
    keyboard: object;
    loop: boolean;
    niceName: string;
    sortIndexFavourite: number;
    sortIndexOverview: number;
    stream_list: TStreamInfo[];
};
export type TPlaylistList = Record<string, TPlaylistInfo>;

export type TClipInfo = {
    niceName: string;
    channel: string;
    keyboard: object;
    sortIndexOverview: number;
};
export type TClipList = Record<string, TClipInfo>;
export type TApiClipType = 'audio' | 'video';
export type TClipStorage = 'SD_DISK' | 'FLASH';

export type TPlaylistQueue = {
    playlist_queue_list: string[];
};
export type TOutputInfo = {
    rtsp_url: string;
    ws: string;
    ws_initial_message: string;
};

export class CamSwitcherAPI {
    private client: IClient;

    constructor(options: CamSwitcherAPIOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }

    }

    }

    }

    }

    }

    }

    //   ----------------------------------------
    //                 Playlists
    //   ----------------------------------------

    getPlaylistList(): Promise<TPlaylistList> {
        return this.get('/local/camswitcher/playlists.cgi?action=get');
    }
    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/playlist_switch.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }
    async playlistQueueClear(): Promise<void> {
        await this.get('/local/camswitcher/playlist_queue_clear.cgi');
    }
    playlistQueueList(): Promise<TPlaylistQueue> {
        return this.get('/local/camswitcher/playlist_queue_list.cgi');
    }
    async playlistQueuePlayNext(): Promise<void> {
        await this.get('/local/camswitcher/playlist_queue_play_next.cgi');
    }

    //   ----------------------------------------
    //                   Clips
    //   ----------------------------------------

    getClipList(): Promise<TClipList> {
        return this.get('/local/camswitcher/clips.cgi?action=get');
    }

    async addNewClip(file: Buffer, clipType: TApiClipType, storage: TClipStorage, id: string, fileName: string) {
        const formData = new FormData();
        formData.append('clip_name', id);
        formData.append('clip_type', clipType);
        formData.append('file', file, fileName);

        const path = `/local/camswitcher/clip_upload.cgi?storage=${storage}`;

        const res = await this.client.post(path, formData);
        const output = (await res.json()) as { status: number; message: string };

        if (output.status !== 200) {
            throw new Error('Error on camera: ' + output.message);
        }
    }

    removeClip(id: string, storage: TClipStorage): Promise<{}> {
        return this.get(`/local/camswitcher/clip_remove.cgi`, { clip_name: id, storage });
    }

    getOutputInfo(): Promise<TOutputInfo> {
        return this.get('/local/camswitcher/output_info.cgi');
    }

    private async get(path: string, parameters: Record<string, string> = {}): Promise<any> {
        const res = await this.client.get(path, parameters);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(JSON.stringify(res));
        }
    }
}
