import * as WebSocket from 'ws';
import * as EventEmitter from 'events';

import { Digest } from './Digest';
import { httpRequest, HttpRequestOptions } from './HTTPRequest';

export type CamOverlayOptions = {
    protocol?: string; // deprecated (replaced by tls)
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    ip?: string;
    port?: number;
    auth?: string;
    serviceName?: string;
    serviceID?: number;
    camera?: number | number[];
};

export type Field = {
    field_name: string;
    text: string;
    color?: string;
};

export type Message = {
    command: string;
    params: any[];
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

export type Align = 'A_RIGHT' | 'A_LEFT' | 'A_CENTER';
export type TextFit = 'TFM_SCALE' | 'TFM_TRUNCATE' | 'TFM_OVERFLOW';
export type WriteTextParams = [string, string, number, number, number, number, Align, TextFit?];

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

type AsyncMessage = {
    resolve;
    reject;
};

export class CamOverlayAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;
    private serviceName: string;
    private serviceID: number;
    private cameraList: number[];
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;

    private ws: WebSocket = null;

    constructor(options?: CamOverlayOptions) {
        super();

        this.tls = options?.tls ?? false;
        if (options?.tls === undefined && options?.protocol !== undefined) {
            this.tls = options.protocol === 'wss';
        }
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';
        this.serviceName = options?.serviceName ?? '';
        this.serviceID = options?.serviceID ?? -1; // If service is already created you can skip creation step by filling this parameter

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
            if (this.serviceID === -1) {
                this.serviceID = await this.createService();
            }
            await this.openWebsocket();
            this.emit('open');
        } catch (err) {
            this.reportErr(err);
        }
    }

    async createService() {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = '/local/camoverlay/api/services.cgi?action=get';
        const response = (await httpRequest(options)) as string;
        let servicesJson: ServiceList;
        try {
            servicesJson = JSON.parse(response);
            servicesJson.services ??= [];
        } catch {
            servicesJson = { services: [] };
        }

        // Find service
        let service: Service = null;
        let maxID = -1;
        let servicesArr = servicesJson.services;
        for (let s of servicesArr) {
            if (s.id > maxID) {
                maxID = s.id;
            }
            if (s.identifier === this.serviceName && s.name === 'scripter') {
                service = s;
                break;
            }
        }

        if (service !== null) {
            // Check and update service parameters if necessary
            if (service.cameraList === undefined || !this.compareCameraList(service.cameraList)) {
                service.cameraList = this.cameraList;
                await this.updateServices(servicesJson);
                return service.id as number;
            } else {
                return service.id as number;
            }
        } else {
            // Create new service
            let newServiceID = maxID + 1;
            service = {
                id: newServiceID,
                enabled: 1,
                schedule: '',
                name: 'scripter',
                identifier: this.serviceName,
                cameraList: this.cameraList,
            };
            servicesJson.services.push(service);
            await this.updateServices(servicesJson);
            return newServiceID;
        }
    }

    async updateServices(servicesJson: ServiceList) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = '/local/camoverlay/api/services.cgi?action=set';
        await httpRequest(options, JSON.stringify(servicesJson));
    }

    openWebsocket(digestHeader?: string) {
        let promise = new Promise<void>((resolve, reject) => {
            const userPass = this.auth.split(':');
            const protocol = this.tls ? 'wss' : 'ws';
            const addr = `${protocol}://${this.ip}:${this.port}/local/camoverlay/ws`;

            const options = {
                auth: this.auth,
                rejectUnauthorized: !this.tlsInsecure,
                headers: {},
            };
            if (digestHeader !== undefined) {
                options.headers['Authorization'] = Digest.getAuthHeader(
                    userPass[0],
                    userPass[1],
                    'GET',
                    '/local/camoverlay/ws',
                    digestHeader
                );
            }

            this.ws = new WebSocket(addr, 'cairo-api', options);
            this.ws.on('open', () => {
                this.reportMsg('Websocket opened');
                resolve();
            });

            this.ws.on('message', (data: string) => {
                let dataJSON = JSON.parse(data);
                if (dataJSON.hasOwnProperty('call_id') && dataJSON['call_id'] in this.sendMessages) {
                    this.sendMessages[dataJSON['call_id']].resolve(dataJSON);
                    delete this.sendMessages[dataJSON['call_id']];
                }

                if (dataJSON.hasOwnProperty('error')) {
                    let error = new Error(JSON.stringify(data));
                    this.reportErr(error);
                } else {
                    this.reportMsg(data);
                }
            });

            this.ws.on('unexpected-response', async (req, res) => {
                if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined)
                    this.openWebsocket(res.headers['www-authenticate']).then(resolve, reject);
                else {
                    reject('Error: status code: ' + res.statusCode + ', ' + res.data);
                }
            });

            this.ws.on('error', (error: Error) => {
                this.reportErr(error);
                reject(error);
            });

            this.ws.on('close', () => {
                this.reportClose();
            });
        });
        return promise;
    }

    cairo(command: string, ...params: any[]) {
        return this.sendMessage({ command: command, params: params }) as Promise<CairoResponse | CairoCreateResponse>;
    }

    writeText(...params: WriteTextParams) {
        return this.sendMessage({ command: 'write_text', params: params }) as Promise<CairoResponse>;
    }

    uploadImageData(imgBuffer: Buffer) {
        return this.sendMessage({
            command: 'upload_image_data',
            params: [imgBuffer.toString('base64')],
        }) as Promise<UploadImageResponse>;
    }

    uploadFontData(fontBuffer: Buffer) {
        return this.sendMessage({
            command: 'upload_font_data',
            params: [fontBuffer.toString('base64')],
        }) as Promise<CairoCreateResponse>;
    }

    showCairoImage(cairoImage: string, posX: number, posY: number) {
        return this.sendMessage({
            command: 'show_cairo_image',
            params: [this.serviceID, cairoImage, posX, posY],
        }) as Promise<CairoResponse>;
    }

    showCairoImageAbsolute(cairoImage: string, posX: number, posY: number, width: number, height: number) {
        return this.sendMessage({
            command: 'show_cairo_image',
            params: [this.serviceID, cairoImage, -1.0 + (2.0 / width) * posX, -1.0 + (2.0 / height) * posY],
        }) as Promise<CairoResponse>;
    }

    removeImage() {
        return this.sendMessage({ command: 'remove_image', params: [this.serviceID] }) as Promise<CairoResponse>;
    }

    sendMessage(msgJson: Message) {
        return new Promise<CairoResponse | CairoCreateResponse | UploadImageResponse>((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson['call_id'] = this.callId++;
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportErr(new Error(`Send message error: ${err}`));
            }
        });
    }

    reportMsg(msg: string) {
        this.emit('msg', msg);
    }

    reportErr(err: Error) {
        this.ws?.terminate();
        this.emit('error', err);
        this.emit('close');
    }

    reportClose() {
        this.emit('close');
    }

    updateCGText(fields: Field[]) {
        let field_specs = '';

        for (let field of fields) {
            const name = field.field_name;
            field_specs += `&${name}=${field.text}`;
            if (field.color !== undefined) {
                field_specs += `&${name}_color=${field.color}`;
            }
        }

        return this.promiseCGUpdate('update_text', field_specs);
    }

    /*
    coorinates =
        left
        right
        top
        bottom
        top_left
        center
        ...
    */
    private formCoordinates(coordinates: string, x: number, y: number) {
        return coordinates !== '' ? `&coord_system=${coordinates}&pos_x=${x}&pos_y=${y}` : '';
    }

    updateCGImage(path: string, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const update = `&image=${path}`;
        return this.promiseCGUpdate('update_image', update + coord);
    }

    updateCGImagePos(coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        return this.promiseCGUpdate('update_image', coord);
    }

    async promiseCGUpdate(action: string, params: string) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(
            `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${this.serviceID}${params}`
        );
        await httpRequest(options, '');
    }

    async updateInfoticker(text: string) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = `/local/camoverlay/api/infoticker.cgi?service_id=${this.serviceID}&text=${text}`;
        await httpRequest(options, '');
    }

    async setEnabled(enabled: boolean) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(`/local/camoverlay/api/enabled.cgi?id_${this.serviceID}=${enabled ? 1 : 0}`);
        await httpRequest(options, '');
    }

    async isEnabled() {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = '/local/camoverlay/api/services.cgi?action=get';
        const response = (await httpRequest(options, '')) as string;
        const data: ServiceList = JSON.parse(response);

        for (let service of data.services) {
            if (service.id === this.serviceID) {
                return service.enabled === 1;
            }
        }
        throw new Error('Service not found.');
    }

    private getBaseVapixConnectionParams(): HttpRequestOptions {
        return {
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }

    private compareCameraList(cameraList: number[]) {
        return (
            this.cameraList.length === cameraList.length &&
            this.cameraList.every((element, index) => element === cameraList[index])
        );
    }
}
