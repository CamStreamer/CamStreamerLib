import { Options } from './common';
import { httpRequest, HttpRequestOptions } from './HttpRequest';

export type CamOverlayOptions = Options;

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

export class CamOverlayAPI {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;

    constructor(options?: CamOverlayOptions) {
        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';
    }

    updateCGText(serviceID: number, fields: Field[]) {
        let field_specs = '';

        for (let field of fields) {
            const name = field.field_name;
            field_specs += `&${name}=${field.text}`;
            if (field.color !== undefined) {
                field_specs += `&${name}_color=${field.color}`;
            }
        }

        return this.promiseCGUpdate(serviceID, 'update_text', field_specs);
    }

    updateCGImagePos(serviceID: number, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        return this.promiseCGUpdate(serviceID, 'update_image', coord);
    }

    updateCGImage(serviceID: number, path: string, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const update = `&image=${path}`;
        return this.promiseCGUpdate(serviceID, 'update_image', update + coord);
    }

    async updateInfoticker(serviceID: number, text: string) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = `/local/camoverlay/api/infoticker.cgi?service_id=${serviceID}&text=${text}`;
        await httpRequest(options);
    }

    async setEnabled(serviceID: number, enabled: boolean) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(`/local/camoverlay/api/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`);
        await httpRequest(options);
    }

    async isEnabled(serviceID: number) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'GET';
        options.path = '/local/camoverlay/api/services.cgi?action=get';
        const response = (await httpRequest(options)) as string;
        const data: ServiceList = JSON.parse(response);

        for (let service of data.services) {
            if (service.id === serviceID) {
                return service.enabled === 1;
            }
        }
        throw new Error('Service not found.');
    }

    async updateServices(servicesJson: ServiceList) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = '/local/camoverlay/api/services.cgi?action=set';
        await httpRequest(options, JSON.stringify(servicesJson));
    }

    updateCGImageFromData(serviceID: number, imageType: ImageType, imageData: Buffer, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        return this.promiseCGUpdate(serviceID, 'update_image', coord, contentType, imageData);
    }

    async promiseCGUpdate(serviceID: number, action: string, params: string, contentType?: string, data?: Buffer) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = encodeURI(
            `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${serviceID}${params}`
        );
        if (contentType && data) {
            options.headers = { 'Content-Type': contentType };
        }
        await httpRequest(options, data);
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
