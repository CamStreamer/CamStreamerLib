import { IClient, TParameters, TResponse } from './internal/types';
import { ErrorWithResponse, ServiceNotFoundError, StorageDataFetchError } from './errors/errors';
import { networkCameraListSchema, THttpRequestOptions } from './types/common';
import { z } from 'zod';
import {
    ImageType,
    TCoordinates,
    TField,
    TFile,
    TFileType,
    TFileStorageType,
    TStorageResponse,
    TService,
    TServiceList,
    serviceListSchema,
    servicesSchema,
    wsResponseSchema,
    getStorageDataListSchema,
    getFileListSchema,
    TFileList,
    TStorageDataList,
} from './types/CamOverlayAPI';
import { BasicAPI } from './internal/BasicAPI';

const BASE_PATH = '/local/camoverlay/api';
export class CamOverlayAPI<Client extends IClient<TResponse, any>> extends BasicAPI<Client> {
    static getBasePath = () => BASE_PATH;
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getFilePreviewPath = (path: string) => `${BASE_PATH}/image.cgi?path=${encodeURIComponent(path)}`;

    async checkAPIAvailable(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/api_check.cgi`, undefined, options);
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.state);
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(res.camera_list);
    }

    async wsAuthorization(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        return wsResponseSchema.parse(res).message;
    }

    async getMjpegStreamImage(mjpegUrl: string, options?: THttpRequestOptions) {
        return await this._getBlob(
            `${BASE_PATH}/fetch_mjpeg_image.cgi`,
            { mjpeg_url: decodeURIComponent(mjpegUrl) },
            options
        );
    }

    //   ----------------------------------------
    //            files - fonts, images
    //   ----------------------------------------

    async listFiles<T extends TFileType>(fileType: T, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/upload_${fileType}.cgi`, { action: 'list' }, options);
        return getFileListSchema(fileType).parse(res.list) as TFileList<T>;
    }

    async uploadFile<T extends TFileType>(
        fileType: T,
        formData: Parameters<Client['post']>[0]['data'],
        storage: TFileStorageType<T>,
        options?: THttpRequestOptions
    ) {
        await this._post(
            `${BASE_PATH}/upload_${fileType}.cgi`,
            formData,
            {
                action: 'upload',
                storage: storage,
            },
            options
        );
    }

    async removeFile<T extends TFileType>(fileType: T, fileParams: TFile<T>, options?: THttpRequestOptions) {
        await this._postUrlEncoded(
            `${BASE_PATH}/upload_${fileType}.cgi`,
            {
                action: 'remove',
                ...fileParams,
            },
            options
        );
    }

    async getFileStorage<T extends TFileType>(fileType: T, options?: THttpRequestOptions) {
        const res: TStorageResponse<T> = await this._getJson(
            `${BASE_PATH}/upload_${fileType}.cgi`,
            { action: 'get_storage' },
            options
        );
        if (res.code !== 200) {
            throw new StorageDataFetchError(res);
        }
        return getStorageDataListSchema(fileType).parse(res.list) as TStorageDataList<T>;
    }

    async getFilePreviewFromCamera(path: string, options?: THttpRequestOptions) {
        return await this._getBlob(CamOverlayAPI.getFilePreviewPath(path), undefined, options);
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    async updateInfoticker(serviceId: number, text: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/infoticker.cgi`, { service_id: serviceId, text: text }, options);
    }

    async setEnabled(serviceId: number, enabled: boolean, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/enabled.cgi`, '', { [`id_${serviceId}`]: enabled ? 1 : 0 }, options);
    }

    async isEnabled(serviceId: number, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/services.cgi`,
            parameters: { action: 'get' },
            timeout: options?.timeout,
        });
        if (res.ok) {
            const data: TServiceList = JSON.parse(await res.text());

            for (const service of data.services) {
                if (service.id === serviceId) {
                    return service.enabled === 1;
                }
            }
            throw new ServiceNotFoundError();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    async getSingleService(serviceId: number, options?: THttpRequestOptions) {
        const res = await this._getJson(
            `${BASE_PATH}/services.cgi`,
            {
                action: 'get',
                service_id: serviceId,
            },
            options
        );
        return servicesSchema.parse(res);
    }

    async getServices(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/services.cgi`, { action: 'get' }, options);
        const services = serviceListSchema.parse(res).services;
        return services;
    }

    async updateSingleService(service: TService, options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/services.cgi`,
            service,
            {
                action: 'set',
                service_id: service.id,
            },
            options
        );
    }

    async updateServices(services: TService[], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/services.cgi`,
            { services: services },
            {
                action: 'set',
            },
            options
        );
    }

    //   ----------------------------------------
    //               Custom Graphics
    //   ----------------------------------------

    updateCGText(serviceId: number, fields: TField[], options?: THttpRequestOptions) {
        const params: TParameters = {};

        for (const field of fields) {
            const name = field.field_name;

            params[name] = field.text;
            if (field.color !== undefined) {
                params[`${name}_color`] = field.color;
            }
        }

        return this.promiseCGUpdate(serviceId, 'update_text', params, undefined, undefined, options);
    }

    updateCGImagePos(serviceId: number, coordinates: TCoordinates = '', x = 0, y = 0, options?: THttpRequestOptions) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceId, 'update_image', params, undefined, undefined, options);
    }

    updateCGImage(
        serviceId: number,
        path: string,
        coordinates: TCoordinates = '',
        x = 0,
        y = 0,
        options?: THttpRequestOptions
    ) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
            image: path,
        };
        return this.promiseCGUpdate(serviceId, 'update_image', params, undefined, undefined, options);
    }

    updateCGImageFromData(
        serviceId: number,
        imageType: ImageType,
        imageData: Parameters<Client['post']>[0]['data'],
        coordinates: TCoordinates = '',
        x = 0,
        y = 0,
        options?: THttpRequestOptions
    ) {
        const contentType = imageType === ImageType.PNG ? 'image/png' : 'image/jpeg';
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceId, 'update_image', params, contentType, imageData, options);
    }

    //   ----------------------------------------
    //                   Report
    //   ----------------------------------------

    downloadReport(options?: THttpRequestOptions) {
        return this._getText(`${BASE_PATH}/report.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async promiseCGUpdate(
        serviceId: number,
        action: string,
        params: TParameters = {},
        contentType?: string,
        data?: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        const path = `${BASE_PATH}/customGraphics.cgi`;
        let headers = {};
        if (contentType !== undefined && data !== undefined) {
            headers = { 'Content-Type': contentType };
        }

        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path,
            data: data ?? '',
            parameters: {
                action: action,
                service_id: serviceId.toString(),
                ...params,
            },
            headers,
            timeout: options?.timeout,
        });
        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }
    }
}
