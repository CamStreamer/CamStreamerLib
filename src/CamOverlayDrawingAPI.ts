import * as EventEmitter from 'events';

import { Options } from './common';
import { WsClient, WsClientOptions } from './WsClient';

type CamOverlayDrawingOptions = Options & {
    camera?: number | number[];
    zIndex?: number;
};

export type Message = {
    command: string;
    params?: any[];
};

export type CairoResponse = {
    message: string;
    call_id: number;
};

export type CairoCreateResponse = {
    var: string;
    call_id: number;
};

export type UploadImageResponse = {
    var: string;
    width: number;
    height: number;
    call_id: number;
};

export type Service = {
    id: number;
    enabled: number;
    schedule: string;
    name: string;
    identifier: string;
    cameraList: number[];
};

export type ServiceList = {
    services: Service[];
};

export type Align = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
export type TextFit = 'TFM_SCALE' | 'TFM_TRUNCATE' | 'TFM_OVERFLOW';
export type WriteTextParams = [string, string, number, number, number, number, Align, TextFit?];

type Response = CairoResponse | CairoCreateResponse | UploadImageResponse;
type AsyncMessage = {
    resolve: (value: PromiseLike<Response>) => void;
    reject: (reason: Error) => void;
};

export class CamOverlayDrawingAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;
    private cameraList: number[];
    private zIndex: number;
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;

    private ws: WsClient = null;
    constructor(options?: CamOverlayDrawingOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';
        this.zIndex = options?.zIndex ?? 0;
        this.cameraList = [0];
        if (Array.isArray(options?.camera)) {
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
            this.emit('open');
        } catch (err) {
            this.reportError(err);
        }
    }

    private openWebsocket(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const options: WsClientOptions = {
                ip: this.ip,
                port: this.port,
                address: '/local/camoverlay/ws',
                protocol: 'cairo-api',

                auth: this.auth,
                tls: this.tls,
                tlsInsecure: this.tlsInsecure,
            };
            this.ws = new WsClient(options);

            this.ws.on('open', () => {
                this.reportMessage('Websocket opened');
                resolve();
            });
            this.ws.on('message', (data: Buffer) => {
                let dataJSON = JSON.parse(data.toString());
                if (dataJSON.hasOwnProperty('call_id') && dataJSON['call_id'] in this.sendMessages) {
                    if (dataJSON.hasOwnProperty('error')) {
                        this.sendMessages[dataJSON['call_id']].reject(new Error(dataJSON.error));
                    } else {
                        this.sendMessages[dataJSON['call_id']].resolve(dataJSON);
                    }
                    delete this.sendMessages[dataJSON['call_id']];
                }

                if (dataJSON.hasOwnProperty('error')) {
                    this.reportError(new Error(dataJSON.error));
                } else {
                    this.reportMessage(data.toString());
                }
            });
            this.ws.on('error', (error: Error) => {
                this.reportError(error);
                reject(error);
            });
            this.ws.on('close', () => {
                this.reportClose();
            });

            this.ws.open();
        });
    }

    private reportMessage(msg: string) {
        this.emit('message', msg);
    }

    private reportError(err: Error) {
        this.ws.close();
        this.emit('error', err);
    }

    private reportClose() {
        for (const callId in this.sendMessages) {
            this.sendMessages[callId].reject(new Error('Connection lost'));
        }
        this.sendMessages = {};
        this.emit('close');
    }

    cairo(command: string, ...params: any[]) {
        return this.sendMessage({ command: command, params: params }) as Promise<CairoResponse | CairoCreateResponse>;
    }

    writeText(...params: WriteTextParams) {
        return this.sendMessage({ command: 'write_text', params: params }) as Promise<CairoResponse>;
    }

    uploadImageData(imgBuffer: Buffer) {
        return this.sendBinaryMessage(
            {
                command: 'upload_image_data',
                params: [],
            },
            imgBuffer
        ) as Promise<UploadImageResponse>;
    }

    uploadFontData(fontBuffer: Buffer) {
        return this.sendBinaryMessage(
            {
                command: 'upload_font_data',
                params: [fontBuffer.toString('base64')],
            },
            fontBuffer
        ) as Promise<CairoCreateResponse>;
    }

    showCairoImage(cairoImage: string, posX: number, posY: number) {
        return this.sendMessage({
            command: 'show_cairo_image_v2',
            params: [cairoImage, posX, posY, this.cameraList, this.zIndex],
        }) as Promise<CairoResponse>;
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
        }) as Promise<CairoResponse>;
    }

    removeImage() {
        return this.sendMessage({ command: 'remove_image_v2' }) as Promise<CairoResponse>;
    }

    private sendMessage(msgJson: Message) {
        return new Promise<Response>((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson['call_id'] = this.callId++;
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportError(new Error(`Send message error: ${err}`));
            }
        });
    }

    private sendBinaryMessage(msgJson: Message, data: Buffer) {
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
                this.ws.send(msgBuffer);
            } catch (err) {
                this.reportError(new Error(`Send binary message error: ${err}`));
            }
        });
    }
}
