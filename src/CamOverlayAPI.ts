import { IClient, isClient, responseStringify } from './internal/common';
import { DefaultAgent } from './DefaultAgent';
import {
    CamOverlayOptions,
    fileListSchema,
    ImageType,
    serviceSchema,
    storageSchema,
    TCoordinates,
    TField,
    TFile,
    TFileList,
    TFileType,
    TService,
    TServiceList,
    TStorage,
} from './types/CamOverlayAPI';
import { ParsingBlobError, ServiceNotFoundError } from './errors/errors';
import { networkCameraListSchema, TNetworkCamera } from './types/common';

export class CamOverlayAPI {
    private client: IClient;

    constructor(options: CamOverlayOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    async checkCameraTime(): Promise<boolean> {
        const cameraTime = await this.get('/local/camoverlay/api/camera_time.cgi');
        return cameraTime.state;
    }

    async getNetworkCameraList(): Promise<TNetworkCamera[]> {
        const response = await this.get('/local/camoverlay/api/network_camera_list.cgi');
        return networkCameraListSchema.parse(response.camera_list);
    }

    async wsAutoratization(): Promise<string> {
        const response = await this.get(`/local/camoverlay/api/ws_authorization.cgi`);
        return response.data;
    }

    async getMjpegStreamImage(mjpegUrl: string): Promise<Blob> {
        const res = await this.get(
            `/local/camoverlay/api/fetch_mjpeg_image.cgi?mjpeg_url=${encodeURIComponent(decodeURIComponent(mjpegUrl))}`
        );

        return await this.parseBlobResponse(res);
    }

    //   ----------------------------------------
    //            files - fonts, images
    //   ----------------------------------------

    async listFiles(fileType: TFileType): Promise<TFileList> {
        const files = await this.get(`/local/camoverlay/api/upload_${fileType}.cgi?action=list`);
        return fileListSchema.parse(files.list);
    }

    async uploadFile(fileType: TFileType, file: Buffer, fileName: string): Promise<void> {
        const formData = new FormData();
        formData.append('target', 'SD0');
        formData.append('uploadedFile[]', file, fileName);

        const path = `/local/camoverlay/api/upload_${fileType}.cgi?action=upload`;
        await this.post(path, formData);
    }

    async removeFile(fileType: TFileType, file: TFile): Promise<void> {
        const path = `/local/camoverlay/api/upload_${fileType}.cgi?action=remove`;
        await this.post(path, JSON.stringify(file));
    }

    async getFileStorage(fileType: TFileType): Promise<TStorage> {
        const data = await this.get(`/local/camoverlay/api/upload_${fileType}.cgi?action=get_storage`);
        return storageSchema.parse(data);
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    async updateInfoticker(serviceID: number, text: string): Promise<void> {
        await this.get(`/local/camoverlay/api/infoticker.cgi?service_id=${serviceID}&text=${text}`);
    }

    async setEnabled(serviceID: number, enabled: boolean): Promise<void> {
        await this.post(`/local/camoverlay/api/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`, '');
    }

    async isEnabled(serviceID: number): Promise<boolean> {
        const res = await this.client.get('/local/camoverlay/api/services.cgi?action=get');

        if (res.ok) {
            const data: TServiceList = JSON.parse(await res.text());

            for (const service of data.services) {
                if (service.id === serviceID) {
                    return service.enabled === 1;
                }
            }
            throw new ServiceNotFoundError();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getSingleService(serviceId: number): Promise<TService> {
        const data = await this.get('/local/camoverlay/api/services.cgi', {
            action: 'get',
            service_id: serviceId.toString(),
        });
        return serviceSchema.parse(data);
    }

    async getServices(): Promise<TService[]> {
        const serviceList = await this.get('/local/camoverlay/api/services.cgi?action=get');
        return serviceSchema.parse(serviceList).services;
    }

    async updateSingleService(serviceId: number, serviceJson: TService): Promise<void> {
        const path = '/local/camoverlay/api/services.cgi';
        await this.post(path, JSON.stringify(serviceJson), {
            action: 'set',
            service_id: serviceId.toString(),
        });
    }

    async updateServices(servicesJson: TServiceList): Promise<void> {
        const path = '/local/camoverlay/api/services.cgi?action=set';
        await this.post(path, JSON.stringify(servicesJson));
    }

    //   ----------------------------------------
    //               Custom Graphics
    //   ----------------------------------------

    updateCGText(serviceID: number, fields: TField[]) {
        const params: Record<string, string> = {};

        for (const field of fields) {
            const name = field.field_name;

            params[name] = field.text;
            if (field.color !== undefined) {
                params[`${name}_color`] = field.color;
            }
        }

        return this.promiseCGUpdate(serviceID, 'update_text', params);
    }

    updateCGImagePos(serviceID: number, coordinates: TCoordinates = '', x = 0, y = 0) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceID, 'update_image', params);
    }

    updateCGImage(serviceID: number, path: string, coordinates: TCoordinates = '', x = 0, y = 0) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
            image: path,
        };
        return this.promiseCGUpdate(serviceID, 'update_image', params);
    }

    updateCGImageFromData(
        serviceID: number,
        imageType: ImageType,
        imageData: Buffer,
        coordinates: TCoordinates = '',
        x = 0,
        y = 0
    ) {
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceID, 'update_image', params, contentType, imageData);
    }

    private async promiseCGUpdate(
        serviceID: number,
        action: string,
        params: Record<string, string | number> = {},
        contentType?: string,
        data?: Buffer
    ) {
        const path = `/local/camoverlay/api/customGraphics.cgi`;
        let headers = {};
        if (contentType !== undefined && data) {
            headers = { 'Content-Type': contentType };
        }

        const res = await this.client.post(
            path,
            data ?? '',
            {
                action: action,
                service_id: serviceID.toString(),
                ...params,
            },
            headers
        );
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
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

    private async parseBlobResponse(response: Response): Promise<Blob> | never {
        try {
            return await response.blob();
        } catch (err) {
            throw new ParsingBlobError(err);
        }
    }
}
