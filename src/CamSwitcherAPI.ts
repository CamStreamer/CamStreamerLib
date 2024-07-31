import * as EventEmitter from 'events';

import { DefaultAgent } from './DefaultAgent';
import { IClient, isClient, Options } from './internal/common';

export type CamSwitcherAPIOptions = Options;

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

    getPlaylistList() {
        return this.get('/local/camswitcher/playlists.cgi?action=get');
    }

    getClipList() {
        return this.get('/local/camswitcher/clips.cgi?action=get');
    }

    playlistSwitch(playlistName: string) {
        return this.get(`/local/camswitcher/playlist_switch.cgi?playlist_name=${playlistName}`);
    }

    playlistQueueList() {
        return this.get('/local/camswitcher/playlist_queue_list.cgi');
    }

    playlistQueueClear() {
        return this.get('/local/camswitcher/playlist_queue_clear.cgi');
    }

    playlistQueuePush(playlistName: string) {
        return this.get(`/local/camswitcher/playlist_queue_push.cgi?playlist_name=${playlistName}`);
    }

    playlistQueuePlayNext() {
        return this.get('/local/camswitcher/playlist_queue_play_next.cgi');
    }

    getOutputInfo() {
        return this.get('/local/camswitcher/output_info.cgi');
    }

    async get(path: string) {
        const res = await this.client.get(path);

        if (res.ok) {
            const responseText = JSON.parse(await res.text());
            if (responseText.status === 200) {
                return responseText.data as object;
            } else {
                throw new Error(`Request (${path}) error, response: ${JSON.stringify(responseText)}`);
            }
        } else {
            throw new Error(JSON.stringify(res));
        }
    }
}
