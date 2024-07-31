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

    // Connect for Websocket events
    async connect() {
        try {
            const token = await this.get('/local/camswitcher/ws_authorization.cgi');
            const options: WsClientOptions = {
                ip: this.ip,
                port: this.port,
                user: this.user,
                pass: this.pass,
                tls: this.tls,
                tlsInsecure: this.tlsInsecure,

                address: '/local/camswitcher/events',
                protocol: 'events',
            };
            this.ws = new WsClient(options);

            this.ws.on('open', () => {
                this.ws?.send(JSON.stringify({ authorization: token }));
            });
            this.ws.on('message', (data: Buffer) => {
                try {
                    const parsedData: object = JSON.parse(data.toString());
                    this.emit('event', parsedData);
                } catch (err) {
                    console.log(err);
                }
            });
            this.ws.on('close', () => {
                this.emit('event_connection_close');
            });
            this.ws.on('error', (err: Error) => {
                this.emit('event_connection_error', err);
            });

            this.ws.open();
        } catch (err) {
            this.emit('event_connection_error', err as Error);
        }
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
