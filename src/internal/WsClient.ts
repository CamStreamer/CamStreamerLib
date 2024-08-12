import * as EventEmitter from 'events';
import * as WebSocket from 'ws';

import { Digest } from './Digest';
import { WsOptions } from './common';

export type WsClientOptions = WsOptions & {
    address: string;
    headers?: Record<string, string>;
    pingInterval?: number;
    protocol?: string;
};

export class WsClient extends EventEmitter {
    private user: string;
    private pass: string;
    private address: string;
    private protocol?: string;
    private pingInterval: number;
    private wsOptions: { auth: string; rejectUnauthorized: boolean; headers: Record<string, string> };
    private digestAddress: string;

    private isAlive = true;
    private pingTimer?: NodeJS.Timeout;
    private ws?: WebSocket;

    constructor(options: WsClientOptions) {
        super();

        const tls = options?.tls ?? false;
        const tlsInsecure = options?.tlsInsecure ?? false;
        const ip = options?.ip ?? '127.0.0.1';
        const port = options?.port ?? (tls ? 443 : 80);
        this.user = options?.user ?? '';
        this.pass = options?.pass ?? '';

        const protocol = tls ? 'wss' : 'ws';
        this.address = `${protocol}://${ip}:${port}${options.address}`;
        this.digestAddress = options.address;
        this.pingInterval = options.pingInterval ?? 30000;
        this.protocol = options.protocol;
        this.wsOptions = {
            auth: `${this.user}:${this.pass}`,
            rejectUnauthorized: !tlsInsecure,
            headers: options.headers ?? {},
        };
    }

    open(digestHeader?: string): void {
        if (this.protocol === undefined) {
            this.ws = new WebSocket(this.address, this.wsOptions);
        } else {
            this.ws = new WebSocket(this.address, this.protocol, this.wsOptions);
        }
        this.ws.binaryType = 'arraybuffer';

        this.isAlive = true;
        this.pingTimer = setInterval(() => {
            if ((this.ws && this.ws.readyState !== WebSocket.OPEN) || this.isAlive === false) {
                this.emit('error', new Error('Connection timeout'));
                this.close();
            } else {
                this.isAlive = false;
                this.ws?.ping();
            }
        }, this.pingInterval);
        this.ws.on('pong', () => {
            this.isAlive = true;
        });

        if (digestHeader !== undefined) {
            this.wsOptions.headers['Authorization'] = Digest.getAuthHeader(
                this.user,
                this.pass,
                'GET',
                this.digestAddress,
                digestHeader
            );
        }

        this.ws.on('unexpected-response', (req, res) => {
            if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined) {
                if (this.pingTimer) {
                    clearInterval(this.pingTimer);
                }
                this.open(res.headers['www-authenticate']);
            } else {
                const e = new Error('Status code: ' + res.statusCode);
                this.emit('error', e);
            }
        });

        this.ws.on('open', () => this.emit('open'));
        this.ws.on('message', (data: Buffer) => this.emit('message', data));
        this.ws.on('error', (error: Error) => this.emit('error', error));
        this.ws.on('close', () => this.handleCloseEvent());
    }

    send(data: Buffer | string): void {
        if (this.ws === undefined) {
            throw new Error("This websocket hasn't been opened yet.");
        }
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(data);
        }
    }

    close(): void {
        if (this.ws === undefined) {
            throw new Error("This websocket hasn't been opened yet.");
        }
        try {
            this.handleCloseEvent();
            if (this.ws.readyState !== WebSocket.CLOSING && this.ws.readyState !== WebSocket.CLOSED) {
                this.ws.close();
            }
        } catch (err) {
            // Ignore errors like: WebSocket was closed before the connection was established
        }

        setTimeout(() => {
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                this.ws.terminate();
            }
        }, 5000);
    }

    private handleCloseEvent(): void {
        this.ws?.removeAllListeners();
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
        }
        this.emit('close');
    }
}
