import * as EventEmitter from 'events';

import { Options } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';
import { DefaultAgent } from './DefaultAgent';

export type CamSwitcherAPIOptions = Options;

export class CamSwitcherAPI extends EventEmitter {
    private ws?: WsClient;
    private client: DefaultAgent;

    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;

    constructor(options: CamSwitcherAPIOptions = {}) {
        super();

        this.tls = options.tls ?? false;
        this.tlsInsecure = options.tlsInsecure ?? false;
        this.ip = options.ip ?? '127.0.0.1';
        this.port = options.port ?? (this.tls ? 443 : 80);
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';

        this.client = new DefaultAgent(options);

        EventEmitter.call(this);
    }

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

    private async get(path: string) {
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
