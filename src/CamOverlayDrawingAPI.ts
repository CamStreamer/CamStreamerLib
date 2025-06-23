import * as EventEmitter from 'events';

import { WsOptions } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';

export type CamOverlayDrawingOptions = WsOptions & {
    camera?: number | number[];
    zIndex?: number;
};

type TMessage = {
    command: string;
    call_id?: number;
    params: unknown[];
};

export type TCairoResponse = {
    message: string;
    call_id: number;
};

export type TCairoCreateResponse = {
    var: string;
    call_id: number;
};

export type TUploadImageResponse = {
    var: string;
    width: number;
    height: number;
    call_id: number;
};

export type TErrorResponse = {
    error: string;
    call_id?: number;
};

export type TService = {
    id: number;
    enabled: number;
    schedule: string;
    name: string;
    identifier: string;
    cameraList: number[];
};

export type TServiceList = {
    services: TService[];
};

export type TAlign = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
export type TextFit = 'TFM_SCALE' | 'TFM_TRUNCATE' | 'TFM_OVERFLOW';
export type TWriteTextParams = [string, string, number, number, number, number, TAlign, TextFit?];

type TResponse = TCairoResponse | TCairoCreateResponse | TUploadImageResponse;
type AsyncMessage = {
    resolve: (value: TResponse) => void;
    reject: (reason: Error) => void;
    sentTimestamp: number;
};

export interface CamOverlayDrawingAPI {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'message', listener: (msg: string) => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'error', err: Error): boolean;
    emit(event: 'message', msg: string): boolean;
}

export class CamOverlayDrawingAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;
    private cameraList: number[];
    private zIndex: number;
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;
    private timeoutCheckTimer: NodeJS.Timeout | undefined;
    private wsConnected: boolean;
    private ws!: WsClient;

    constructor(options?: CamOverlayDrawingOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.user = options?.user ?? '';
        this.pass = options?.pass ?? '';
        this.zIndex = options?.zIndex ?? 0;
        this.cameraList = [0];
        if (options && Array.isArray(options.camera)) {
            this.cameraList = options.camera;
        } else if (typeof options?.camera === 'number') {
            this.cameraList = [options.camera];
        }

        this.callId = 0;
        this.sendMessages = {};

        this.wsConnected = false;
        this.createWsClient();

        EventEmitter.call(this);
    }

    connect() {
        this.ws.open();
        this.startMsgsTimeoutCheck();
    }

    disconnect() {
        this.ws.close();
        this.stopMsgsTimeoutCheck();
    }

    isConnected() {
        return this.wsConnected;
    }

    cairo(command: string, ...params: unknown[]) {
        return this.sendMessage({ command: command, params: params }) as Promise<TCairoResponse | TCairoCreateResponse>;
    }

    writeText(...params: TWriteTextParams) {
        return this.sendMessage({ command: 'write_text', params: params }) as Promise<TCairoResponse>;
    }

    uploadImageData(imgBuffer: Buffer) {
        return this.sendBinaryMessage(
            {
                command: 'upload_image_data',
                params: [],
            },
            imgBuffer
        ) as Promise<TUploadImageResponse>;
    }

    uploadFontData(fontBuffer: Buffer) {
        return this.sendBinaryMessage(
            {
                command: 'upload_font_data',
                params: [fontBuffer.toString('base64')],
            },
            fontBuffer
        ) as Promise<TCairoCreateResponse>;
    }

    showCairoImage(cairoImage: string, posX: number, posY: number) {
        return this.sendMessage({
            command: 'show_cairo_image_v2',
            params: [cairoImage, posX, posY, this.cameraList, this.zIndex],
        }) as Promise<TCairoResponse>;
    }

    showCairoImageAbsolute(cairoImage: string, posX: number, posY: number, width: number, height: number) {
        return this.sendMessage({
            command: 'show_cairo_image_v2',
            params: [
                cairoImage,
                -1.0 + (2.0 / width) * posX,
                -1.0 + (2.0 / height) * posY,
                this.cameraList,
                this.zIndex,
            ],
        }) as Promise<TCairoResponse>;
    }

    removeImage() {
        return this.sendMessage({ command: 'remove_image_v2', params: [] }) as Promise<TCairoResponse>;
    }

    private createWsClient() {
        const options: WsClientOptions = {
            ip: this.ip,
            port: this.port,
            address: '/local/camoverlay/ws',
            protocol: 'cairo-api',
            user: this.user,
            pass: this.pass,
            tls: this.tls,
            tlsInsecure: this.tlsInsecure,
        };
        this.ws = new WsClient(options);

        this.ws.on('open', () => {
            console.log('CamOverlay connection opened');
            this.wsConnected = true;
            this.emit('open');
        });
        this.ws.on('message', (msgData: Buffer) => this.incomingWsMessageHandler(msgData));
        this.ws.on('error', (error: Error) => {
            this.reportError(error);
        });
        this.ws.on('close', () => {
            console.log('CamOverlay connection closed');
            this.wsConnected = false;
            this.reportClose();
        });
    }

    private incomingWsMessageHandler(msgData: Buffer) {
        const dataJSON = JSON.parse(msgData.toString()) as TResponse | TErrorResponse;

        let errorResponse: TErrorResponse | undefined;
        if ('error' in dataJSON) {
            errorResponse = dataJSON as TErrorResponse;
        }

        if (dataJSON.call_id !== undefined) {
            if (errorResponse !== undefined) {
                this.sendMessages[dataJSON.call_id].reject(new Error(errorResponse.error));
            } else {
                this.sendMessages[dataJSON.call_id].resolve(dataJSON as TResponse);
            }
            delete this.sendMessages[dataJSON.call_id];
        }

        if (errorResponse !== undefined) {
            this.reconnectWithError(new Error(errorResponse.error));
        } else {
            this.reportMessage(msgData.toString());
        }
    }

    private sendMessage(msgJson: TMessage) {
        return new Promise<TResponse>((resolve, reject) => {
            try {
                if (!this.wsConnected) {
                    throw new Error('No CamOverlay connection');
                }
                msgJson.call_id = ++this.callId;
                this.ws.send(JSON.stringify(msgJson));
                this.sendMessages[this.callId] = { resolve, reject, sentTimestamp: Date.now() };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                const error = new Error(`Send message error: ${errorMessage}`);
                reject(error);
                if (!this.wsConnected) {
                    this.reportError(error);
                } else {
                    this.reconnectWithError(error);
                }
            }
        });
    }

    private sendBinaryMessage(msgJson: TMessage, data: Buffer) {
        return new Promise<TResponse>((resolve, reject) => {
            try {
                if (!this.wsConnected) {
                    throw new Error('No CamOverlay connection');
                }

                msgJson.call_id = ++this.callId;
                const jsonBuffer = Buffer.from(JSON.stringify(msgJson));

                const header = new ArrayBuffer(5);
                const headerView = new DataView(header);
                headerView.setInt8(0, 1);
                headerView.setInt32(1, jsonBuffer.byteLength);

                const msgBuffer = Buffer.concat([Buffer.from(header), jsonBuffer, data]);

                this.ws.send(msgBuffer);
                this.sendMessages[this.callId] = { resolve, reject, sentTimestamp: Date.now() };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                const error = new Error(`Send binary message error: ${errorMessage}`);
                reject(error);
                if (!this.wsConnected) {
                    this.reportError(error);
                } else {
                    this.reconnectWithError(error);
                }
            }
        });
    }

    private startMsgsTimeoutCheck() {
        clearInterval(this.timeoutCheckTimer);
        this.timeoutCheckTimer = setInterval(() => {
            let reconnect = false;
            const now = Date.now();
            for (const callId in this.sendMessages) {
                const msg = this.sendMessages[callId];
                if (now - msg.sentTimestamp > 10000) {
                    reconnect = true;
                    msg.reject(new Error('Message timeout'));
                    delete this.sendMessages[callId];
                }
            }
            if (reconnect) {
                this.reconnectWithError(new Error('Message timeout'));
            }
        }, 5000);
    }

    private stopMsgsTimeoutCheck() {
        clearInterval(this.timeoutCheckTimer);
    }

    private reconnectWithError(err: Error) {
        this.reportError(err);
        this.ws.reconnect();
    }

    private reportMessage(msg: string) {
        this.emit('message', msg);
    }

    private reportError(err: Error) {
        this.emit('error', err);
    }

    private reportClose() {
        for (const callId in this.sendMessages) {
            this.sendMessages[callId].reject(new Error('Connection lost'));
        }
        this.sendMessages = {};
        this.emit('close');
    }
}
