import { Options } from './common';
import { sendRequest, HttpRequestOptions } from './HttpRequest';

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

        for (const field of fields) {
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
        const path = `/local/camoverlay/api/infoticker.cgi?service_id=${serviceID}&text=${text}`;
        const options = this.getBaseVapixConnectionParams(path);
        const res = await sendRequest(options);

        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
    }

    async setEnabled(serviceID: number, enabled: boolean) {
        const path = `/local/camoverlay/api/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`;
        const options = this.getBaseVapixConnectionParams(path, 'POST');
        const res = await sendRequest(options);

        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
    }

    async isEnabled(serviceID: number) {
        const path = '/local/camoverlay/api/services.cgi?action=get';
        const options = this.getBaseVapixConnectionParams(path);
        const res = await sendRequest(options);

        if (res.ok) {
            const data: ServiceList = JSON.parse(await res.text());

            for (const service of data.services) {
                if (service.id === serviceID) {
                    return service.enabled === 1;
                }
            }
            throw new Error('Service not found.');
        } else {
            throw new Error(JSON.stringify(res));
        }
    }

    async updateServices(servicesJson: ServiceList) {
        const path = '/local/camoverlay/api/services.cgi?action=set';
        const options = this.getBaseVapixConnectionParams(path, 'POST');
        const res = await sendRequest(options, JSON.stringify(servicesJson));

        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
    }

    updateCGImageFromData(serviceID: number, imageType: ImageType, imageData: Buffer, coordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        return this.promiseCGUpdate(serviceID, 'update_image', coord, contentType, imageData);
    }

    async promiseCGUpdate(serviceID: number, action: string, params: string, contentType?: string, data?: Buffer) {
        const path = `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${serviceID}${params}`;
        const options = this.getBaseVapixConnectionParams(path, 'POST');
        if (contentType !== undefined && data) {
            options.headers = { 'Content-Type': contentType };
        }
        const res = await sendRequest(options, data);
        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
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

    private getBaseVapixConnectionParams(path: string, method = 'GET'): HttpRequestOptions {
        return {
            method: method,
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            path: path,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }
}
