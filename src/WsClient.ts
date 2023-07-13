import * as EventEmitter from 'events';
import * as WebSocket from 'ws';

import { Digest } from './Digest';
import { Options } from './common';

export type WsClientOptions = Options & {
    address: string;
    headers?: object;
    pingInterval?: number;
    protocol?: string;
};

export class WsClient extends EventEmitter {
    private userPass: string[];
    private address: string;
    private protocol: string;
    private pingInterval: number;
    private wsOptions: any;

    private isAlive = true;
    private pingTimer: NodeJS.Timeout = null;
    private ws: WebSocket = null;

    constructor(options?: WsClientOptions) {
        super();

        const tls = options?.tls ?? false;
        const tlsInsecure = options?.tlsInsecure ?? false;
        const ip = options?.ip ?? '127.0.0.1';
        const port = options?.port ?? (tls ? 443 : 80);
        const auth = options?.auth ?? '';

        const protocol = tls ? 'wss' : 'ws';
        this.address = `${protocol}://${ip}:${port}${options.address}`;
        this.pingInterval = options.pingInterval ?? 30000;
        this.protocol = options.protocol;
        this.userPass = auth.split(':');
        this.wsOptions = {
            auth: options.auth,
            rejectUnauthorized: !tlsInsecure,
            headers: options.headers ?? {},
        };
    }

    open(digestHeader?: string): void {
        if (this.protocol == undefined) {
            this.ws = new WebSocket(this.address, this.wsOptions);
        } else {
            this.ws = new WebSocket(this.address, this.protocol, this.wsOptions);
        }
        this.ws.binaryType = 'arraybuffer';

        this.isAlive = true;
        this.pingTimer = setInterval(() => {
            if (this.ws.readyState !== this.ws.OPEN || this.isAlive === false) {
                this.emit('error', new Error('Connection timeout'));
                this.close();
            } else {
                this.isAlive = false;
                this.ws.ping();
            }
        }, this.pingInterval);
        this.ws.on('pong', () => {
            this.isAlive = true;
        });

        if (digestHeader !== undefined) {
            this.wsOptions.headers['Authorization'] = Digest.getAuthHeader(
                this.userPass[0],
                this.userPass[1],
                'GET',
                '/local/camoverlay/ws',
                digestHeader
            );
        }

        this.ws.on('unexpected-response', async (req, res) => {
            if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined) {
                this.open(res.headers['www-authenticate']);
            } else {
                const e = new Error('Error: status code: ' + res.statusCode + ', ' + res.data);
                this.emit('error', e);
            }
        });

        this.ws.on('open', () => this.emit('open'));
        this.ws.on('message', (data: Buffer) => this.emit('message', data));
        this.ws.on('error', (error: Error) => this.emit('error', error));
        this.ws.on('close', () => this.emit('close'));
    }

    send(data: Buffer | string): void {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(data);
        }
    }

    close(): void {
        try {
            this.handleCloseEvent();
            this.ws.close();
        } catch (err) {
            this.emit('error', err);
        }

        setTimeout(() => {
            if (this.ws.readyState == this.ws.OPEN || this.ws.readyState == this.ws.CLOSING) {
                this.ws.terminate();
            }
        }, 5000);
    }

    private handleCloseEvent(): void {
        this.ws.removeAllListeners();
        clearInterval(this.pingTimer);
        this.emit('close');
    }
}
