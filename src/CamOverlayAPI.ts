import { IClient, responseStringify, TParameters, TResponse } from './internal/common';

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
import { networkCameraListSchema } from './types/common';
import { z } from 'zod';
import { widgetsSchema } from './models/CamOverlayAPI/widgetsSchema';
import { fileListSchema, storageSchema } from './models/CamOverlayAPI/fileSchema';
import { paramToUrl } from './internal/utils';

export const BASE_URL = '/local/camoverlay/api';

export class CamOverlayAPI<Client extends IClient = IClient> {
    constructor(public client: Client) {}

    static getProxyUrlPath = () => `${BASE_URL}/proxy.cgi`;
    static getFilePreviewPath = (path: string) => `${BASE_URL}/image.cgi?path=${encodeURIComponent(path)}`;

    async checkCameraTime() {
        const responseSchema = z.discriminatedUnion('state', [
            z.object({
                state: z.literal(true),
                code: z.number(),
            }),
            // Error response
            z.object({
                state: z.literal(false),
                code: z.number(),
                reason: z.union([
                    z.literal('INVALID_TIME'),
                    z.literal('COULDNT_RESOLVE_HOST'), // NOTE: typo on server already
                    z.literal('CONNECTION_ERROR'),
                ]),
                message: z.string(),
            }),
        ]);

        const response = await this._get<z.infer<typeof responseSchema>>(`${BASE_URL}/camera_time.cgi`);
        const cameraTime = responseSchema.parse(response);

        if (!cameraTime.state) {
            // create logger
            console.error(`Camera time check failed: ${cameraTime.reason} - ${cameraTime.message}`);
            // throw new Error(`Camera time check failed: ${cameraTime.reason} - ${cameraTime.message}`);
        }

        return cameraTime.state;
    }

    async getNetworkCameraList() {
        const response = await this._get(`${BASE_URL}/network_camera_list.cgi`);
        return networkCameraListSchema.parse(response.camera_list);
    }

    async wsAuthorization() {
        const responseSchema = z.object({
            status: z.number(),
            message: z.string(),
            data: z.string(),
        });

        const response = await this._get<z.infer<typeof responseSchema>>(`${BASE_URL}/ws_authorization.cgi`);
        return responseSchema.parse(response).data;
    }

    async getMjpegStreamImage(mjpegUrl: string) {
        return await this._getBlob(
            `${BASE_URL}/fetch_mjpeg_image.cgi?mjpeg_url=${encodeURIComponent(decodeURIComponent(mjpegUrl))}`
        );
    }

    //   ----------------------------------------
    //            files - fonts, images
    //   ----------------------------------------

    async listFiles(fileType: TFileType) {
        const fileDataSchema = z.object({
            code: z.number(),
            list: fileListSchema,
        });
        const files = await this._get<z.infer<typeof fileDataSchema>>(`${BASE_URL}/upload_${fileType}.cgi`, {
            action: 'list',
        });
        return fileListSchema.parse(files.list);
    }

    async uploadFile(fileType: TFileType, formData: FormData, storage: TStorage): Promise<void> {
        const path = `${BASE_URL}/upload_${fileType}.cgi`;
        await this._post(path, formData, {
            action: 'upload',
            storage: storage,
        });
    }

    async removeFile(fileType: TFileType, fileParams: TFile): Promise<void> {
        const path = `${BASE_URL}/upload_${fileType}.cgi`;
        await this._postUrlEncoded(path, {
            action: 'remove',
            ...fileParams,
        });
    }

    async getFileStorage(fileType: TFileType) {
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
        const data = await this._get<z.infer<typeof responseSchema>>(`${BASE_URL}/upload_${fileType}.cgi`, {
            action: 'get_storage',
        });
        if (data.code !== 200) {
            throw new Error('Error occured while fetching file storage data');
        }
        return storageDataListSchema.parse(data.list);
    }

    async getFilePreviewFromCamera(path: string) {
        return await this._getBlob(CamOverlayAPI.getFilePreviewPath(path));
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    async updateInfoticker(serviceID: number, text: string): Promise<void> {
        await this._get(`${BASE_URL}/infoticker.cgi?service_id=${serviceID}&text=${text}`);
    }

    async setEnabled(serviceID: number, enabled: boolean): Promise<void> {
        await this._post(`${BASE_URL}/enabled.cgi?id_${serviceID}=${enabled ? 1 : 0}`, '');
    }

    async isEnabled(serviceID: number): Promise<boolean> {
        const res = await this.client.get(`${BASE_URL}/services.cgi?action=get`);

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

    async getSingleWidget(serviceId: number) {
        const data = await this._get<TWidget>(`${BASE_URL}/services.cgi`, {
            action: 'get',
            service_id: serviceId.toString(),
        });
        return widgetsSchema.parse(data);
    }

    async getWidgets() {
        const widgetList = await this._get<TWidgetList>(`${BASE_URL}/services.cgi`, {
            action: 'get',
        });
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

    async updateSingleWidget(widget: TWidget): Promise<void> {
        const path = `${BASE_URL}/services.cgi`;
        await this._postJsonEncoded(path, JSON.stringify(widget), {
            action: 'set',
            service_id: widget.id.toString(),
        });
    }

    async updateWidgets(widgets: TWidget[]): Promise<void> {
        const path = `${BASE_URL}/services.cgi`;
        await this._postJsonEncoded(path, JSON.stringify({ services: widgets }), {
            action: 'set',
        });
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
        const path = `${BASE_URL}/customGraphics.cgi`;
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

    private async _get<TResponseData = any>(...args: Parameters<IClient['get']>): Promise<TResponseData> | never {
        const res = await this.client.get(...args);

        if (res.ok) {
            return (await res.json()) as TResponseData;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async _post<TResponseData = any>(...args: Parameters<IClient['post']>): Promise<TResponseData> | never {
        const res = await this.client.post(...args);

        if (res.ok) {
            return (await res.json()) as TResponseData;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _getBlob(...args: Parameters<IClient['get']>) {
        const res = await this.client.get(...args);

        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async parseBlobResponse(response: TResponse) {
        try {
            return await response.blob();
        } catch (err) {
            throw new ParsingBlobError(err);
        }
    }

    private async _postUrlEncoded<TResponseData = any>(
        path: string,
        params: TParameters,
        headers?: Record<string, string>
    ): Promise<TResponseData> | never {
        const data = paramToUrl(params);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post(path, data, {}, { ...baseHeaders, ...headers });
    }

    private async _postJsonEncoded<TResponseData = any>(
        ...args: Parameters<IClient['post']>
    ): Promise<TResponseData> | never {
        const [path, data, params, headers] = args;
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return this._post(path, data, params, { ...baseHeaders, ...headers });
    }
}
