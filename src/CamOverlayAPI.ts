import { IClient, TBlobResponse, TParameters, TResponse } from './internal/types';
import { paramToUrl, responseStringify } from './internal/utils';

import {
    ImageType,
    TCoordinates,
    TField,
    TFile,
    TFileType,
    TStorage,
    TWidget,
    TWidgetList,
} from './types/CamOverlayAPI';
import { ParsingBlobError, ServiceNotFoundError } from './errors/errors';
import { networkCameraListSchema, THttpRequestOptions, TProxyParams } from './types/common';
import { z } from 'zod';
import { widgetsSchema } from './models/CamOverlayAPI/widgetsSchema';
import { fileListSchema, storageSchema } from './models/CamOverlayAPI/fileSchema';
import { ProxyClient } from './internal/ProxyClient';

const BASE_PATH = '/local/camoverlay/api';
export class CamOverlayAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(private client: Client) {}

    static getBasePath = () => BASE_PATH;
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getFilePreviewPath = (path: string) => `${BASE_PATH}/image.cgi?path=${encodeURIComponent(path)}`;

    async checkCameraTime(options?: THttpRequestOptions) {
        const response = await this._get({ path: `${BASE_PATH}/camera_time.cgi` }, options);
        return z.boolean().parse(response.state);
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const response = await this._get({ path: `${BASE_PATH}/network_camera_list.cgi` }, options);
        return networkCameraListSchema.parse(response.camera_list);
    }

    async wsAuthorization(options?: THttpRequestOptions) {
        const responseSchema = z.object({
            status: z.number(),
            message: z.string(),
            data: z.string(),
        });

        const response = await this._get<z.infer<typeof responseSchema>>(
            { path: `${BASE_PATH}/ws_authorization.cgi` },
            options
        );
        return responseSchema.parse(response).data;
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
        const fileDataSchema = z.object({
            code: z.number(),
            list: fileListSchema,
        });
        const files = await this._get<z.infer<typeof fileDataSchema>>(
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
        formData: FormData,
        storage: TStorage,
        options?: THttpRequestOptions
    ): Promise<void> {
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

    async removeFile(fileType: TFileType, fileParams: TFile, options?: THttpRequestOptions): Promise<void> {
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
        const storageDataListSchema = z.array(
            z.object({
                type: storageSchema,
                state: z.string(),
            })
        );
        const responseSchema = z.object({
            code: z.number(),
            list: storageDataListSchema,
        });
        const data = await this._get<z.infer<typeof responseSchema>>(
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

    async updateInfoticker(serviceID: number, text: string, options?: THttpRequestOptions): Promise<void> {
        await this._get({ path: `${BASE_PATH}/infoticker.cgi?service_id=${serviceID}&text=${text}` }, options);
    }

    async setEnabled(serviceID: number, enabled: boolean, options?: THttpRequestOptions): Promise<void> {
        await this._post({ path: `${BASE_PATH}/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`, data: '' }, options);
    }

    async isEnabled(serviceID: number, options?: THttpRequestOptions): Promise<boolean> {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ path: `${BASE_PATH}/services.cgi?action=get`, timeout: options?.timeout });
        if (res.ok) {
            const data: TWidgetList = JSON.parse(await res.text());

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

    async getSingleWidget(serviceId: number, options?: THttpRequestOptions) {
        const data = await this._get<TWidget>(
            {
                path: `${BASE_PATH}/services.cgi`,
                parameters: {
                    action: 'get',
                    service_id: serviceId.toString(),
                },
            },
            options
        );
        return widgetsSchema.parse(data);
    }

    async getWidgets(options?: THttpRequestOptions) {
        const widgetList = await this._get<TWidgetList>(
            {
                path: `${BASE_PATH}/services.cgi`,
                parameters: {
                    action: 'get',
                },
            },
            options
        );
        const widgets = widgetList.services;

        widgets.forEach((widget) => {
            const parsedWidget = widgetsSchema.safeParse(widget);
            if (!parsedWidget.success) {
                console.warn(
                    `[SERVICE SCHEMA MISMATCH]: Service ${widget.name} (${widget.id}) does not match the current schema, or is a hidden service.`
                );
            }
        });

        return widgets;
    }

    async updateSingleWidget(widget: TWidget, options?: THttpRequestOptions): Promise<void> {
        const path = `${BASE_PATH}/services.cgi`;
        await this._postJsonEncoded(
            path,
            JSON.stringify(widget),
            {
                action: 'set',
                service_id: widget.id.toString(),
            },
            undefined,
            options
        );
    }

    async updateWidgets(widgets: TWidget[], options?: THttpRequestOptions): Promise<void> {
        const path = `${BASE_PATH}/services.cgi`;
        await this._postJsonEncoded(
            path,
            JSON.stringify({ services: widgets }),
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

    updateCGText(serviceID: number, fields: TField[], options?: THttpRequestOptions) {
        const params: Record<string, string> = {};

        for (const field of fields) {
            const name = field.field_name;

            params[name] = field.text;
            if (field.color !== undefined) {
                params[`${name}_color`] = field.color;
            }
        }

        return this.promiseCGUpdate(serviceID, 'update_text', params, undefined, undefined, options);
    }

    updateCGImagePos(serviceID: number, coordinates: TCoordinates = '', x = 0, y = 0, options?: THttpRequestOptions) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceID, 'update_image', params, undefined, undefined, options);
    }

    updateCGImage(
        serviceID: number,
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
        return this.promiseCGUpdate(serviceID, 'update_image', params, undefined, undefined, options);
    }

    updateCGImageFromData(
        serviceID: number,
        imageType: ImageType,
        imageData: Buffer,
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
        return this.promiseCGUpdate(serviceID, 'update_image', params, contentType, imageData, options);
    }

    private async promiseCGUpdate(
        serviceID: number,
        action: string,
        params: Record<string, string | number> = {},
        contentType?: string,
        data?: Buffer,
        options?: THttpRequestOptions
    ) {
        const path = `${BASE_PATH}/customGraphics.cgi`;
        let headers = {};
        if (contentType !== undefined && data) {
            headers = { 'Content-Type': contentType };
        }

        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({
            path,
            data: data ?? '',
            parameters: {
                action: action,
                service_id: serviceID.toString(),
                ...params,
            },
            headers,
            timeout: options?.timeout,
        });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
    }

    private async _get<TResponseData = any>(
        params: {
            path: string;
            parameters?: TParameters;
            headers?: Record<string, string>;
        },
        options?: THttpRequestOptions
    ): Promise<TResponseData> | never {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return (await res.json()) as TResponseData;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async _post<TResponseData = any>(
        params: {
            path: string;
            data: string | Buffer | FormData;
            parameters?: TParameters;
            headers?: Record<string, string>;
        },
        options?: THttpRequestOptions
    ): Promise<TResponseData> | never {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return (await res.json()) as TResponseData;
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
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ ...params, timeout: options?.timeout });
        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async parseBlobResponse(response: TResponse) {
        try {
            return (await response.blob()) as unknown as TBlobResponse<Client>;
        } catch (err) {
            throw new ParsingBlobError(err);
        }
    }

    private async _postUrlEncoded<TResponseData = any>(
        path: string,
        params: TParameters,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ): Promise<TResponseData> | never {
        const data = paramToUrl(params);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post({ path, data, headers: { ...baseHeaders, ...headers } }, options);
    }

    private async _postJsonEncoded<TResponseData = any>(
        path: string,
        data: string | Buffer | FormData,
        parameters?: TParameters,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ): Promise<TResponseData> | never {
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return this._post({ path, data, parameters, headers: { ...baseHeaders, ...headers } }, options);
    }

    private getAgent(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }
}
