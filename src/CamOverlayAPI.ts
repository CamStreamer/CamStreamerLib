import { HttpOptions, IClient, isClient, responseStringify } from './internal/common';
import { DefaultAgent } from './DefaultAgent';

export type CamOverlayOptions = HttpOptions;

export type TField = {
    field_name: string;
    text: string;
    color?: string;
};

export type TService = Record<string, any>;

export type TServiceList = {
    services: TService[];
};

export type TNetworkCameraList = {
    name: string;
    ip: string;
}[];

export type TImage = {
    name: string;
    path: string;
    storage: string;
};

export enum ImageType {
    PNG,
    JPEG,
}

export type TCoordinates =
    | 'top_left'
    | 'top_right'
    | 'top'
    | 'bottom_left'
    | 'bottom_right'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | '';

export class CamOverlayAPI {
    private client: IClient;

    constructor(options: CamOverlayOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    async getCameraTime(): Promise<boolean> {
        const cameraTime = await this.get('/local/camoverlay/api/camera_time.cgi');
        return cameraTime.state;
    }

    async listImages(): Promise<TImage[]> {
        const images = await this.get('/local/camoverlay/api/upload_image.cgi?action=list');
        return images.list;
    }

    async uploadImage(file: Buffer, fileName: string): Promise<void> {
        const formData = new FormData();
        formData.append('target', 'SD0');
        formData.append('uploadedFile[]', file, fileName);

        const path = '/local/camoverlay/api/upload_image.cgi?action=upload';
        await this.post(path, formData);
    }

    async getNetworkCameraList(): Promise<TNetworkCameraList> {
        const response = await this.get('/local/camoverlay/api/network_camera_list.cgi');
        return response.camera_list;
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    async updateInfoticker(serviceID: number, text: string) {
        const path = `/local/camoverlay/api/infoticker.cgi?service_id=${serviceID}&text=${text}`;
        const res = await this.client.get(path);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
    }

    async setEnabled(serviceID: number, enabled: boolean) {
        const path = `/local/camoverlay/api/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`;
        const res = await this.client.post(path, '');

        if (!res.ok) {
            throw new Error(await responseStringify(res));
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
            throw new Error(await responseStringify(res));
        }
    }

    async getSingleService(serviceId: number): Promise<TService> {
        return this.get('/local/camoverlay/api/services.cgi', { action: 'get', service_id: serviceId.toString() });
    }

    async getServices(): Promise<TService[]> {
        const serviceList = await this.get('/local/camoverlay/api/services.cgi?action=get');
        return serviceList.services;
    }

    async updateSingleService(serviceId: number, serviceJson: TService): Promise<void> {
        const path = '/local/camoverlay/api/services.cgi';
        await this.post(path, JSON.stringify(serviceJson), {
            action: 'set',
            service_id: serviceId.toString(),
        });
    }

    async updateServices(servicesJson: TServiceList) {
        const path = '/local/camoverlay/api/services.cgi?action=set';
        const res = await this.client.post(path, JSON.stringify(servicesJson));

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
    }

    //   ----------------------------------------
    //               Custom Graphics
    //   ----------------------------------------

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

    updateCGImagePos(serviceID: number, coordinates: TCoordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        return this.promiseCGUpdate(serviceID, 'update_image', coord);
    }

    updateCGImage(serviceID: number, path: string, coordinates: TCoordinates = '', x = 0, y = 0) {
        const coord = this.formCoordinates(coordinates, x, y);
        const update = `&image=${path}`;
        return this.promiseCGUpdate(serviceID, 'update_image', update + coord);
    }

    updateCGImageFromData(
        serviceID: number,
        imageType: ImageType,
        imageData: Buffer,
        coordinates: TCoordinates = '',
        x = 0,
        y = 0
    ) {
        const coord = this.formCoordinates(coordinates, x, y);
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        return this.promiseCGUpdate(serviceID, 'update_image', coord, contentType, imageData);
    }

    private async promiseCGUpdate(
        serviceID: number,
        action: string,
        params: string,
        contentType?: string,
        data?: Buffer
    ) {
        const path = `/local/camoverlay/api/customGraphics.cgi?action=${action}&service_id=${serviceID}${params}`;
        let headers = {};
        if (contentType !== undefined && data) {
            headers = { 'Content-Type': contentType };
        }

        const res = await this.client.post(path, data ?? '', {}, headers);
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
    }

    private formCoordinates(coordinates: TCoordinates, x: number, y: number) {
        return coordinates !== '' ? `&coord_system=${coordinates}&pos_x=${x}&pos_y=${y}` : '';
    }

    private async get(path: string, params?: Record<string, string>): Promise<any> {
        const res = await this.client.get(path, params);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async post(path: string, data: string | Buffer | FormData, params?: Record<string, string>): Promise<any> {
        const res = await this.client.post(path, data, params);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
