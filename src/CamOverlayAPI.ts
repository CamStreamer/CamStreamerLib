import { HttpOptions, IClient, isClient } from './internal/common';
import { DefaultAgent } from './DefaultAgent';

export type CamOverlayOptions = HttpOptions;

export type TField = {
    field_name: string;
    text: string;
    color?: string;
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

export enum ImageType {
    PNG,
    JPEG,
}

export class CamOverlayAPI {
    private client: IClient;

    constructor(options: CamOverlayOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    updateCGText(serviceID: number, fields: TField[]) {
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
        const res = await this.client.get(path);

        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
    }

    async setEnabled(serviceID: number, enabled: boolean) {
        const path = `/local/camoverlay/api/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`;
        const res = await this.client.post(path, '');

        if (!res.ok) {
            throw new Error(JSON.stringify(res));
        }
    }

    async isEnabled(serviceID: number) {
        const path = '/local/camoverlay/api/services.cgi?action=get';
        const res = await this.client.get(path);

        if (res.ok) {
            const data: TServiceList = JSON.parse(await res.text());

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

    async updateServices(servicesJson: TServiceList) {
        const path = '/local/camoverlay/api/services.cgi?action=set';
        const res = await this.client.post(path, JSON.stringify(servicesJson));

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
        let headers = {};
        if (contentType !== undefined && data) {
            headers = { 'Content-Type': contentType };
        }

        const res = await this.client.post(path, data ?? '', {}, headers);
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
}
