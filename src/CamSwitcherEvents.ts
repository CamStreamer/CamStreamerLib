import * as EventEmitter from 'events';

import { HttpOptions } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';
import { DefaultAgent } from './DefaultAgent';

export type CamSwitcherEventsOptions = HttpOptions;
export type TEvent = {
    type: string;
    date: Record<string, string | number | boolean> & { type: string };
};

export interface CamSwitcherEvents {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'event', listener: (data: TEvent) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'event', data: TEvent): boolean;
    emit(event: 'error', err: Error): boolean;
}
export class CamSwitcherEvents extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;

    private client: DefaultAgent;
    private ws!: WsClient;

    constructor(options: CamSwitcherEventsOptions = {}) {
        super();

        this.tls = options.tls ?? false;
        this.tlsInsecure = options.tlsInsecure ?? false;
        this.ip = options.ip ?? '127.0.0.1';
        this.port = options.port ?? (this.tls ? 443 : 80);
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';

        this.client = new DefaultAgent(options);
        this.createWsClient();

        EventEmitter.call(this);
    }

    connect() {
        this.ws.open();
    }

    disconnect() {
        this.ws.close();
    }

    private createWsClient() {
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

        this.ws.on('open', async () => {
            try {
                const token = await this.get('/local/camswitcher/ws_authorization.cgi');
                this.ws.send(JSON.stringify({ authorization: token }));
                this.emit('open');
            } catch (err) {
                this.emit('error', err);
                this.ws.close();
                this.ws.open();
            }
        });
        this.ws.on('message', (data: Buffer) => {
            try {
                const parsedData: object = JSON.parse(data.toString());
                this.emit('event', parsedData);
            } catch (err) {
                console.error(err);
            }
        });
        this.ws.on('error', (err: Error) => {
            this.emit('error', err);
        });
        this.ws.on('close', () => {
            this.emit('close');
        });
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
