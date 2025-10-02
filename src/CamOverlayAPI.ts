import { IClient, TBlobResponse, TParameters, TResponse } from './internal/types';
import { paramToUrl, responseStringify } from './internal/utils';

import { ParsingBlobError, ServiceNotFoundError } from './errors/errors';
import { networkCameraListSchema, THttpRequestOptions, TProxyParams } from './types/common';
import { z } from 'zod';
import { ProxyClient } from './internal/ProxyClient';
import {
    fileListSchema,
    ImageType,
    storageDataListSchema,
    TCoordinates,
    TField,
    TFile,
    TFileData,
    TFileType,
    TStorage,
    TStorageResponse,
    TService,
    TServiceList,
    serviceListSchema,
    servicesSchema,
    WSResponseSchema,
} from './types/CamOverlayAPI';

const BASE_PATH = '/local/camoverlay/api';
export class CamOverlayAPI<Client extends IClient<TResponse, any>> {
    constructor(private client: Client) {}

    static getBasePath = () => BASE_PATH;
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getFilePreviewPath = (path: string) => `${BASE_PATH}/image.cgi?path=${encodeURIComponent(path)}`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const response = await this._get({ path: `${BASE_PATH}/camera_time.cgi` }, options);
        return z.boolean().parse(response.state);
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const response = await this._get({ path: `${BASE_PATH}/network_camera_list.cgi` }, options);
        return networkCameraListSchema.parse(response.camera_list);
    }

    async wsAuthorization(options?: THttpRequestOptions) {
        const response = await this._get({ path: `${BASE_PATH}/ws_authorization.cgi` }, options);
        return WSResponseSchema.parse(response).message;
    }

    async getMjpegStreamImage(mjpegUrl: string, options?: THttpRequestOptions) {
        return await this._getBlob(
            {
                path: `${BASE_PATH}/fetch_mjpeg_image.cgi?mjpeg_url=${encodeURIComponent(
                    decodeURIComponent(mjpegUrl)
                )}`,
            },
            options
        );
    }

    //   ----------------------------------------
    //            files - fonts, images
    //   ----------------------------------------

    async listFiles(fileType: TFileType, options?: THttpRequestOptions) {
        const files: TFileData = await this._get(
            {
                path: `${BASE_PATH}/upload_${fileType}.cgi`,
                parameters: {
                    action: 'list',
                },
            },
            options
        );
        return fileListSchema.parse(files.list);
    }

    async uploadFile(
        fileType: TFileType,
        formData: Parameters<Client['post']>[0]['data'],
        storage: TStorage,
        options?: THttpRequestOptions
    ) {
        await this._post(
            {
                path: `${BASE_PATH}/upload_${fileType}.cgi`,
                data: formData,
                parameters: {
                    action: 'upload',
                    storage: storage,
                },
            },
            options
        );
    }

    async removeFile(fileType: TFileType, fileParams: TFile, options?: THttpRequestOptions) {
        const path = `${BASE_PATH}/upload_${fileType}.cgi`;
        await this._postUrlEncoded(
            path,
            {
                action: 'remove',
                ...fileParams,
            },
            undefined,
            options
        );
    }

    async getFileStorage(fileType: TFileType, options?: THttpRequestOptions) {
        const data: TStorageResponse = await this._get(
            {
                path: `${BASE_PATH}/upload_${fileType}.cgi`,
                parameters: {
                    action: 'get_storage',
                },
            },
            options
        );
        if (data.code !== 200) {
            throw new Error('Error occured while fetching file storage data');
        }
        return storageDataListSchema.parse(data.list);
    }

    async getFilePreviewFromCamera(path: string, options?: THttpRequestOptions) {
        return await this._getBlob({ path: CamOverlayAPI.getFilePreviewPath(path) }, options);
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    async updateInfoticker(serviceId: number, text: string, options?: THttpRequestOptions) {
        await this._get({ path: `${BASE_PATH}/infoticker.cgi?service_id=${serviceId}&text=${text}` }, options);
    }

    async setEnabled(serviceId: number, enabled: boolean, options?: THttpRequestOptions) {
        await this._post({ path: `${BASE_PATH}/enabled.cgi?id_${serviceId}=${enabled ? 1 : 0}`, data: '' }, options);
    }

    async isEnabled(serviceId: number, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path: `${BASE_PATH}/services.cgi?action=get`, timeout: options?.timeout });
        if (res.ok) {
            const data: TServiceList = JSON.parse(await res.text());

            for (const service of data.services) {
                if (service.id === serviceId) {
                    return service.enabled === 1;
                }
            }
            throw new ServiceNotFoundError();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getSingleService(serviceId: number, options?: THttpRequestOptions) {
        const data = await this._get(
            {
                path: `${BASE_PATH}/services.cgi`,
                parameters: {
                    action: 'get',
                    service_id: serviceId.toString(),
                },
            },
            options
        );
        return servicesSchema.parse(data);
    }

    async getServices(options?: THttpRequestOptions) {
        const serviceList: TServiceList = await this._get(
            {
                path: `${BASE_PATH}/services.cgi`,
                parameters: {
                    action: 'get',
                },
            },
            options
        );
        const services = serviceListSchema.parse(serviceList).services;

        services.forEach((service) => {
            const parsedService = servicesSchema.safeParse(service);
            if (!parsedService.success) {
                console.warn(
                    `[SERVICE SCHEMA MISMATCH]: Service ${service.name} (${service.id}) does not match the current schema, or is a hidden service.`
                );
            }
        });

        return services;
    }

    async updateSingleService(service: TService, options?: THttpRequestOptions) {
        const path = `${BASE_PATH}/services.cgi`;
        await this._postJsonEncoded(
            path,
            JSON.stringify(service),
            {
                action: 'set',
                service_id: service.id.toString(),
            },
            undefined,
            options
        );
    }

    async updateServices(services: TService[], options?: THttpRequestOptions) {
        const path = `${BASE_PATH}/services.cgi`;
        await this._postJsonEncoded(
            path,
            JSON.stringify({ services: services }),
            {
                action: 'set',
            },
            undefined,
            options
        );
    }

    //   ----------------------------------------
    //               Custom Graphics
    //   ----------------------------------------

    updateCGText(serviceId: number, fields: TField[], options?: THttpRequestOptions) {
        const params: Record<string, string> = {};

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
    //                   Private
    //   ----------------------------------------

    private async promiseCGUpdate(
        serviceId: number,
        action: string,
        params: Record<string, string | number> = {},
        contentType?: string,
        data?: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        const path = `${BASE_PATH}/customGraphics.cgi`;
        let headers = {};
        if (contentType !== undefined && data) {
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
            throw new Error(await responseStringify(res));
        }
    }

    private async _get(
        params: {
            path: string;
            parameters?: TParameters;
            headers?: Record<string, string>;
        },
        options?: THttpRequestOptions
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async _post(
        params: {
            path: string;
            data: string | Parameters<Client['post']>[0]['data'];
            parameters?: TParameters;
            headers?: Record<string, string>;
        },
        options?: THttpRequestOptions
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _getBlob(
        params: {
            path: string;
            parameters?: TParameters;
            headers?: Record<string, string>;
        },
        options?: THttpRequestOptions
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async parseBlobResponse(response: TResponse) {
        try {
            return (await response.blob()) as TBlobResponse<Client>;
        } catch (err) {
            throw new ParsingBlobError(err);
        }
    }

    private async _postUrlEncoded(
        path: string,
        params: TParameters,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ) {
        const data = paramToUrl(params);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post({ path, data, headers: { ...baseHeaders, ...headers } }, options);
    }

    private async _postJsonEncoded(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ) {
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return this._post({ path, data, parameters, headers: { ...baseHeaders, ...headers } }, options);
    }
}
