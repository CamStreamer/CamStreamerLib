import * as EventEmitter from 'events';

import { Options } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';
import { HttpRequestOptions, sendRequest } from './internal/HttpRequest';

export type CamSwitcherAPIOptions = Options;

export class CamSwitcherAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;

    private ws?: WsClient;

    constructor(options?: CamSwitcherAPIOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';

        EventEmitter.call(this);
    }

    // Connect for Websocket events
    async connect() {
        try {
            const token = await this.get('/local/camswitcher/ws_authorization.cgi');
            const options: WsClientOptions = {
                ip: this.ip,
                port: this.port,
                auth: this.auth,
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
        const options = this.getBaseConnectionParams(path);
        const res = await sendRequest(options);

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

    private getBaseConnectionParams(path: string, method = 'GET'): HttpRequestOptions {
        return {
            method: method,
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            path: path,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }
}
