import { WebSocket } from 'ws';

import { Digest } from './Digest';
import { IWsClient, Options } from '../internal/types';

export type WsClientOptions = Options & {
    address: string;
    headers?: Record<string, string>;
    pingInterval?: number;
    protocol?: string;
};

export class WsClient implements IWsClient {
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
        const tls = options.tls ?? false;
        const tlsInsecure = options.tlsInsecure ?? false;
        const ip = options.ip ?? '127.0.0.1';
        const port = options.port ?? (tls ? 443 : 80);
        this.user = options.user ?? '';
        this.pass = options.pass ?? '';

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
            this.pingTimer = setInterval(() => {
                if ((this.ws && this.ws.readyState !== WebSocket.OPEN) || this.isAlive === false) {
                    this.onError(new Error('Connection timeout'));
                    this.closeWsConnection();
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

            this.ws.on('unexpected-response', (req, res) => {
                if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined) {
                    if (this.pingTimer) {
                        clearInterval(this.pingTimer);
                    }
                    this.ws?.removeAllListeners();
                    this.ws = undefined;
                    this.open(res.headers['www-authenticate']);
                } else {
                    this.onError(new Error('Status code: ' + res.statusCode));
                    this.closeWsConnection();
                }
            });

            this.ws.on('open', () => this.onOpen());
            this.ws.on('message', (data: ArrayBuffer, isBinary: boolean) => {
                const message = isBinary ? data : data.toString();
                this.onMessage(message);
            });
            this.ws.on('error', (error: Error) => {
                this.onError(error);
                this.closeWsConnection();
            });
            this.ws.on('close', () => this.closeWsConnection());
        } catch (error) {
            this.onError(error instanceof Error ? error : new Error('Unknown error'));
            this.closeWsConnection();
        }
    }

    onMessage = (_: ArrayBuffer | string) => {};
    onOpen = () => {};
    onClose = () => {};
    onError = (error: Error) => {
        console.error(error);
    };

    send(data: ArrayBuffer | string): void {
        if (this.ws === undefined) {
            throw new Error("This websocket hasn't been opened yet.");
        }
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(data);
        }
    }

    destroy() {
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

            this.onClose();
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
