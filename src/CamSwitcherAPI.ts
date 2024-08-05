import * as EventEmitter from 'events';

import { DefaultAgent } from './DefaultAgent';
import { IClient, isClient, Options } from './internal/common';

export type CamSwitcherAPIOptions = Options;

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
export type TClipInfo = {
    niceName: string;
    channel: string;
    keyboard: object;
    sortIndexOverview: number;
};

export type TPlaylistList = Record<string, TPlaylistInfo>;
export type TClipList = Record<string, TClipInfo>;
export type TPlaylistQueue = {
    playlist_queue_list: string[];
};
export type TOutputInfo = {
    rtsp_url: string;
    ws: string;
    ws_initial_message: string;
};

export class CamSwitcherAPI extends EventEmitter {
    private client: IClient;

    constructor(options: CamSwitcherAPIOptions | IClient = {}) {
        super();

        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }

        EventEmitter.call(this);
    }

    getPlaylistList(): Promise<TPlaylistList> {
        return this.get('/local/camswitcher/playlists.cgi?action=get');
    }

    getClipList(): Promise<TClipList> {
        return this.get('/local/camswitcher/clips.cgi?action=get');
    }

    async playlistSwitch(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/playlist_switch.cgi?playlist_name=${playlistName}`);
    }

    playlistQueueList(): Promise<TPlaylistQueue> {
        return this.get('/local/camswitcher/playlist_queue_list.cgi');
    }

    async playlistQueueClear(): Promise<void> {
        await this.get('/local/camswitcher/playlist_queue_clear.cgi');
    }

    async playlistQueuePush(playlistName: string): Promise<void> {
        await this.get(`/local/camswitcher/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }

    async playlistQueuePlayNext(): Promise<void> {
        await this.get('/local/camswitcher/playlist_queue_play_next.cgi');
    }

    getOutputInfo(): Promise<TOutputInfo> {
        return this.get('/local/camswitcher/output_info.cgi');
    }

    async get(path: string): Promise<any> {
        const res = await this.client.get(path);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(JSON.stringify(res));
        }
    }
}
