import { httpRequest, HttpRequestOptions } from './HTTPRequest';

import * as EventEmitter from 'events';

export type CamOverlayOptions = {
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    ip?: string;
    port?: number;
    auth?: string;
};

export type Field = {
    field_name: string;
    text: string;
    color?: string;
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

export enum ImageType {
    PNG,
    JPEG,
}

export class CamOverlayAPI extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;
    private serviceID: number;

    constructor(options?: CamOverlayOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        
        EventEmitter.call(this);
    }

    async updateServices(servicesJson: ServiceList) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = '/local/camoverlay/api/services.cgi?action=set';
        await httpRequest(options, JSON.stringify(servicesJson));
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

    updateCGImageFromData(imageType: ImageType, imageData: Buffer, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        return this.promiseCGUpdate('update_image', coord, contentType, imageData);
    }

    updateCGImagePos(coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        return this.promiseCGUpdate('update_image', coord);
    }

    async promiseCGUpdate(action: string, params: string, contentType?: string, data?: Buffer) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(
            `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${this.serviceID}${params}`
        );
        if (contentType && data) {
            options.headers = { 'Content-Type': contentType };
        }
        await httpRequest(options, data);
    }

    async updateInfoticker(text: string) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = `/local/camoverlay/api/infoticker.cgi?service_id=${this.serviceID}&text=${text}`;
        await httpRequest(options);
    }

    async setEnabled(enabled: boolean) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(`/local/camoverlay/api/enabled.cgi?id_${this.serviceID}=${enabled ? 1 : 0}`);
        await httpRequest(options);
    }

    async isEnabled() {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = '/local/camoverlay/api/services.cgi?action=get';
        const response = (await httpRequest(options)) as string;
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
}
