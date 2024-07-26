import * as EventEmitter from 'events';
import { setTimeout } from 'timers/promises';

import { Options } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';

export type CamOverlayDrawingOptions = Options & {
    camera?: number | number[];
    zIndex?: number;
};

type TMessage = {
    command: string;
    call_id?: number;
    params?: unknown[];
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

type Response = TCairoResponse | TCairoCreateResponse | TUploadImageResponse;
type AsyncMessage = {
    resolve: (value: Response) => void;
    reject: (reason: Error) => void;
};

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

    private connected = false;
    private ws?: WsClient;
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

        EventEmitter.call(this);
    }

    async connect() {
        try {
            await this.openWebsocket();
            this.connected = true;
        } catch (err) {
            // Error is already reported
        }
    }

    disconnect() {
        this.connected = false;
        if (this.ws !== undefined) {
            this.ws.close();
        }
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
        return this.sendMessage({ command: 'remove_image_v2' }) as Promise<TCairoResponse>;
    }

    private openWebsocket(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
                this.emit('open');
                resolve();
            });
            this.ws.on('message', (data: Buffer) => {
                const dataJSON = JSON.parse(data.toString());
                if (Object.hasOwn(dataJSON, 'call_id') && dataJSON['call_id'] in this.sendMessages) {
                    if (Object.hasOwn(dataJSON, 'error')) {
                        this.sendMessages[dataJSON.call_id].reject(new Error(dataJSON.error));
                    } else {
                        this.sendMessages[dataJSON.call_id].resolve(dataJSON);
                    }
                    delete this.sendMessages[dataJSON['call_id']];
                }

                if (Object.hasOwn(dataJSON, 'error')) {
                    this.reportError(new Error(dataJSON.error));
                } else {
                    this.reportMessage(data.toString());
                }
            });
            this.ws.on('error', (error: Error) => {
                this.reportError(error);
                reject(error);
            });
            this.ws.on('close', async () => {
                this.ws = undefined;
                this.reportClose();
                if (this.connected) {
                    try {
                        await setTimeout(10000);
                        void this.openWebsocket();
                    } catch (err) {
                        // Error is already reported
                    }
                }
            });

            this.ws.open();
        });
    }

    private sendMessage(msgJson: TMessage) {
        return new Promise<Response>((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson['call_id'] = this.callId++;

                if (this.ws === undefined) {
                    throw new Error('No CamOverlay connection');
                }
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportError(new Error(`Send message error: ${err}`));
            }
        });
    }

    private sendBinaryMessage(msgJson: TMessage, data: Buffer) {
        return new Promise<Response>((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson['call_id'] = this.callId++;

                const jsonBuffer = Buffer.from(JSON.stringify(msgJson));

                const header = new ArrayBuffer(5);
                const headerView = new DataView(header);
                headerView.setInt8(0, 1);
                headerView.setInt32(1, jsonBuffer.byteLength);

                const msgBuffer = Buffer.concat([Buffer.from(header), jsonBuffer, data]);

                if (this.ws === undefined) {
                    throw new Error('No CamOverlay connection');
                }
                this.ws.send(msgBuffer);
            } catch (err) {
                this.reportError(new Error(`Send binary message error: ${err}`));
            }
        });
    }

    private reportMessage(msg: string) {
        this.emit('message', msg);
    }

    private reportError(err: Error) {
        if (this.ws !== undefined) {
            this.ws.close();
        }
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
