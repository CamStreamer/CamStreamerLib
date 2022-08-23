import * as WebSocket from 'ws';
import * as EventEmitter from 'events';

import { Digest } from './Digest';
import { httpRequest } from './HTTPRequest';

export type CamOverlayOptions = {
    protocol?: string;
    ip?: string;
    port?: number;
    auth?: string;
    serviceName?: string;
    serviceID?: number;
    camera?: number;
};

export type Field = {
    field_name: string;
    text: string;
    color?: string;
};

type Service = {
    id: number;
    enabled: number;
    schedule: string;
    name: string;
    identifier: string;
    camera: number;
};

type ServiceJson = {
    services: Service[];
};

type AsyncMessage = {
    resolve;
    reject;
};

export class CamOverlayAPI extends EventEmitter {
    private protocol: string;
    private ip: string;
    private port: number;
    private auth: string;
    private serviceName: string;
    private serviceID: number;
    private camera: number;
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;

    private ws: WebSocket = null;

    constructor(options?: CamOverlayOptions) {
        super();

        this.protocol = options?.protocol ?? 'ws';
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? this.protocol == 'ws' ? 80 : 443;
        this.auth = options?.auth ?? '';
        this.serviceName = options?.serviceName ?? '';
        this.serviceID = options?.serviceID ?? -1; // If service is already created you can skip creation step by filling this parameter
        this.camera = options?.camera ?? 0;

        this.callId = 0;
        this.sendMessages = {};

        EventEmitter.call(this);
    }

    async connect() {
        if (this.serviceID != -1) {
            await this.openWebsocket();
        } else {
            try {
                let id = await this.createService();
                this.serviceID = id;
                await this.openWebsocket();
            } catch (err) {
                this.reportErr(err);
            }
        }
    }

    async createService() {
        const options = {
            host: this.ip,
            port: this.port,
            path: '/local/camoverlay/api/services.cgi?action=get',
            auth: this.auth,
        };
        const response = (await httpRequest(options)) as string;
        let servicesJson: ServiceJson;
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
            if (s.identifier == this.serviceName && s.name == 'scripter') {
                service = s;
                break;
            }
        }

        if (service != null) {
            if (service.enabled == 1) {
                // Check and update service parameters if necessary
                if (service.camera == undefined || service.camera != this.camera) {
                    service.camera = this.camera;
                    await this.updateServices(servicesJson);
                    return service.id as number;
                } else {
                    return service.id as number;
                }
            } else {
                throw new Error('CamOverlay service is not enabled');
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
                camera: this.camera,
            };
            servicesJson.services.push(service);
            await this.updateServices(servicesJson);
            return newServiceID;
        }
    }

    async updateServices(servicesJson: ServiceJson) {
        const options = {
            method: 'POST',
            host: this.ip,
            port: this.port,
            path: '/local/camoverlay/api/services.cgi?action=set',
            auth: this.auth,
        };
        await httpRequest(options, JSON.stringify(servicesJson));
    }

    openWebsocket(digestHeader?: string) {
        let promise = new Promise<void>((resolve, reject) => {
            let userPass = this.auth.split(':');
            let addr = `${this.protocol}://${this.ip}:${this.port}/local/camoverlay/ws`;

            let options = {
                auth: this.auth,
                headers: {},
            };
            if (digestHeader != undefined) {
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
                if (res.statusCode == 401 && res.headers['www-authenticate'] != undefined)
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

    cairo(command: string, ...params) {
        return this.sendMessage({ command: command, params: params });
    }

    writeText(...params) {
        return this.sendMessage({ command: 'write_text', params: params });
    }

    uploadImageData(imgBuffer: Buffer) {
        return this.sendMessage({ command: 'upload_image_data', params: [imgBuffer.toString('base64')] });
    }

    uploadFontData(fontBuffer: Buffer) {
        return this.sendMessage({ command: 'upload_font_data', params: [fontBuffer.toString('base64')] });
    }

    showCairoImage(cairoImage, posX: number, posY: number) {
        return this.sendMessage({ command: 'show_cairo_image', params: [this.serviceID, cairoImage, posX, posY] });
    }

    removeImage() {
        return this.sendMessage({ command: 'remove_image', params: [this.serviceID] });
    }

    showCairoImageAbsolute(cairoImage, posX: number, posY: number, width: number, height: number) {
        return this.sendMessage({
            command: 'show_cairo_image',
            params: [this.serviceID, cairoImage, -1.0 + (2.0 / width) * posX, -1.0 + (2.0 / height) * posY],
        });
    }

    sendMessage(msgJson) {
        let promise = new Promise((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson['call_id'] = this.callId++;
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportErr(new Error(`Send message error: ${err}`));
            }
        });
        return promise;
    }

    reportMsg(msg: string) {
        this.emit('msg', msg);
    }

    reportErr(err: Error) {
        this.ws?.terminate();
        this.emit('error', err);
    }

    reportClose() {
        this.emit('close');
    }

    updateCGText(fields: Field[]) {
        let field_specs = '';

        for (let field of fields) {
            const name = field.field_name;
            field_specs += `&${name}=${field.text}`;
            if (field.color != undefined) {
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
        return coordinates != '' ? `&coord_system=${coordinates}&pos_x=${x}&pos_y=${y}` : '';
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
        const path = encodeURI(
            `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${this.serviceID}${params}`
        );
        const options = {
            method: 'POST',
            host: this.ip,
            port: this.port,
            path: path,
            auth: this.auth,
        };
        await httpRequest(options, '');
    }

    async updateInfoticker(text: string) {
        const path = `/local/camoverlay/api/infoticker.cgi?service_id=${this.serviceID}&text=${text}`;

        const options = {
            method: 'GET',
            host: this.ip,
            port: this.port,
            path: path,
            auth: this.auth,
        };
        await httpRequest(options, '');
    }

    async setEnabled(enabled: boolean) {
        const value = enabled ? 1 : 0;
        const path = encodeURI(`/local/camoverlay/api/enabled.cgi?id_${this.serviceID}=${value}`);
        const options = {
            method: 'POST',
            host: this.ip,
            port: this.port,
            path: path,
            auth: this.auth,
        };
        await httpRequest(options, '');
    }

    async isEnabled() {
        const options = {
            method: 'GET',
            host: this.ip,
            port: this.port,
            path: '/local/camoverlay/api/services.cgi?action=get',
            auth: this.auth,
        };
        const response = (await httpRequest(options, '')) as string;
        const data: ServiceJson = JSON.parse(response);

        for (let service of data.services) {
            if (service.id == this.serviceID) {
                return service.enabled == 1;
            }
        }
        throw new Error('Service not found.');
    }
}
