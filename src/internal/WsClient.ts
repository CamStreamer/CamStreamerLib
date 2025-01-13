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

export interface WsClient {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'message', listener: (data: Buffer) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'message', data: Buffer): boolean;
    emit(event: 'error', err: Error): boolean;
}
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
    private isClosed = false;

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

    open(wwwAuthenticateHeader?: string): void {
        try {
            if (this.ws !== undefined) {
                return;
            }
            this.isClosed = false;

            if (this.protocol === undefined) {
                this.ws = new WebSocket(this.address, this.wsOptions);
            } else {
                this.ws = new WebSocket(this.address, this.protocol, this.wsOptions);
            }
            this.ws.binaryType = 'arraybuffer';

            this.isAlive = true;
            this.pingTimer = setInterval(async () => {
                if ((this.ws && this.ws.readyState !== WebSocket.OPEN) || this.isAlive === false) {
                    this.emit('error', new Error('Connection timeout'));
                    await this.closeWsConnection();
                } else {
                    this.isAlive = false;
                    this.ws?.ping();
                }
            }, this.pingInterval);
            this.ws.on('pong', () => {
                this.isAlive = true;
            });

            if (wwwAuthenticateHeader !== undefined) {
                this.wsOptions.headers['Authorization'] = new Digest().getAuthHeader(
                    this.user,
                    this.pass,
                    'GET',
                    this.digestAddress,
                    wwwAuthenticateHeader
                );
            }

            this.ws.on('unexpected-response', async (req, res) => {
                if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined) {
                    if (this.pingTimer) {
                        clearInterval(this.pingTimer);
                    }
                    this.ws?.removeAllListeners();
                    this.ws = undefined;
                    this.open(res.headers['www-authenticate']);
                } else {
                    this.emit('error', new Error('Status code: ' + res.statusCode));
                    await this.closeWsConnection();
                }
            });

            this.ws.on('open', () => this.emit('open'));
            this.ws.on('message', (data: Buffer) => this.emit('message', data));
            this.ws.on('error', (error: Error) => {
                this.emit('error', error);
                this.closeWsConnection();
            });
            this.ws.on('close', () => this.closeWsConnection());
        } catch (error) {
            this.emit('error', error instanceof Error ? error : new Error('Unknown error'));
            this.closeWsConnection();
        }
    }

    send(data: Buffer | string): void {
        if (this.ws === undefined) {
            throw new Error("This websocket hasn't been opened yet.");
        }
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(data);
        }
    }

    close() {
        if (this.isClosed) {
            return;
        }
        this.isClosed = true;
        this.closeWsConnection();
    }

    reconnect() {
        this.closeWsConnection();
    }

    private closeWsConnection() {
        if (this.ws === undefined) {
            return;
        }
        const wsCopy = this.ws;
        this.ws = undefined;

        try {
            if (this.pingTimer) {
                clearInterval(this.pingTimer);
            }

            // Ignore errors like: WebSocket was closed before the connection was established
            wsCopy.removeAllListeners();
            wsCopy.on('error', () => {});

            if (wsCopy.readyState !== WebSocket.CLOSING && wsCopy.readyState !== WebSocket.CLOSED) {
                wsCopy.close();
            }

            setTimeout(() => {
                if (wsCopy.readyState !== WebSocket.CLOSED) {
                    wsCopy.terminate();
                }
            }, 5000);

            this.emit('close');
        } catch (err) {
            console.error(err);
        } finally {
            const shouldRestart = !this.isClosed;
            setTimeout(() => {
                wsCopy.removeAllListeners();
                if (shouldRestart && !this.isClosed) {
                    this.open();
                }
            }, 10000);
        }
    }
}
