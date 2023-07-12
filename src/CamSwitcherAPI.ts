import * as WebSocket from 'ws';
import * as EventEmitter from 'events';

import { httpRequest, HttpRequestOptions } from './HttpRequest';

export type CamSwitcherAPIOptions = {
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    ip?: string;
    port?: number;
    auth?: string;
};

export class CamSwitcherAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;

    private ws: WebSocket;
    private pingTimer: NodeJS.Timer;

    constructor(options: CamSwitcherAPIOptions) {
        super();
        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? 80;
        this.auth = options?.auth ?? '';
        EventEmitter.call(this);
    }

    // Connect for Websocket events
    async connect() {
        try {
            const token = await this.get('/local/camswitcher/ws_authorization.cgi');
            const protocol = this.tls ? 'wss' : 'ws';
            this.ws = new WebSocket(`${protocol}://${this.ip}:${this.port}/local/camswitcher/events`, 'events', {
                rejectUnauthorized: !this.tlsInsecure,
            });
            this.pingTimer = null;

            this.ws.on('open', () => {
                this.ws.send(JSON.stringify({ authorization: token }));
                this.ws.isAlive = true;
                this.pingTimer = setInterval(() => {
                    if (this.ws.isAlive === false) {
                        return this.ws.terminate();
                    }
                    this.ws.isAlive = false;
                    this.ws.ping();
                }, 30000);
            });

            this.ws.on('pong', () => {
                this.ws.isAlive = true;
            });

            this.ws.on('message', (data: string) => {
                try {
                    const parsedData: object = JSON.parse(data);
                    this.emit('event', parsedData);
                } catch (err) {
                    console.log(err);
                }
            });

            this.ws.on('close', () => {
                clearInterval(this.pingTimer);
                this.emit('event_connection_close');
            });

            this.ws.on('error', (err: Error) => {
                this.emit('event_connection_error', err);
            });
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
        const options = this.getBaseConnectionParams();
        options.path = encodeURI(path);
        const data = (await httpRequest(options)) as string;
        try {
            const response = JSON.parse(data);
            if (response.status == 200) {
                return response.data as object;
            } else {
                throw new Error(`Request (${path}) error, response: ${JSON.stringify(response)}`);
            }
        } catch (err) {
            throw new Error(`Request (${path}) error: ${err}, msg: ${data}`);
        }
    }

    private getBaseConnectionParams(): HttpRequestOptions {
        return {
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }
}
