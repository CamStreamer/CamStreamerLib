import { IClient, TBlobResponse, TParameters, TResponse } from './internal/types';
import { paramToUrl } from './internal/utils';

import { ParsingBlobError, ErrorWithResponse, ServiceNotFoundError, StorageDataFetchError } from './errors/errors';
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
    TFileType,
    TFileStorageType,
    TStorageResponse,
    TService,
    TServiceList,
    serviceListSchema,
    servicesSchema,
    wsResponseSchema,
} from './types/CamOverlayAPI';

const BASE_PATH = '/local/camoverlay/api';
export class CamOverlayAPI<Client extends IClient<TResponse, any>> {
    constructor(private client: Client) {}

    /**
     * Gets the base path of the CamOverlay API.
     * @returns The base path string for the API endpoints
     */
    static getBasePath = () => BASE_PATH;
    /**
     * Gets the relative path to proxy.cgi endpoint.
     * @returns The proxy path string
     */
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    /**
     * Returns a path to preview of a file stored on the camera.
     * @param path - Path to the file on the camera
     * @returns The complete URL path to preview the file with encoded path parameter
     */
    static getFilePreviewPath = (path: string) => `${BASE_PATH}/image.cgi?path=${encodeURIComponent(path)}`;

    /**
     * Gets the CamOverlay client, optionally wrapped with proxy configuration.
     * @param proxyParams - Optional proxy parameters for routing requests through a proxy
     * @returns The client instance, either the original or wrapped in ProxyClient
     */
    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    /**
     * Check camera time against CamStreamer server.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to a boolean indicating whether the camera time is correct
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.state);
    }

    /**
     * Find cameras on the local network using mDNS protocol.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to an array of network cameras
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async getNetworkCameraList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(res.camera_list);
    }

    /**
     * Get the WebSocket authorization token to authorize event websocket.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to the WebSocket authorization token string
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async wsAuthorization(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, undefined, options);
        return wsResponseSchema.parse(res).message;
    }

    /**
     * Fetches a single frame image from an MJPEG stream.
     * @param mjpegUrl - The URL of the MJPEG stream
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to a Blob containing the image data
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example const data = await coApi.getMjpegStreamImage('http://example.com/mjpegstream');
     */
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

    /**
     * Lists all uploaded files of a specific type (images or fonts) on the camera.
     * @param fileType - The type of files to list ('image' or 'font')
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to an array of file information objects
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     * @example
     * const images = await coApi.listFiles('image');
     * const fonts = await coApi.listFiles('font');
     */
    async listFiles(fileType: TFileType, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/upload_${fileType}.cgi`, { action: 'list' }, options);
        return fileListSchema.parse(res.list);
    }

    /**
     * Uploads a new file (image or font) to the camera.
     * @param fileType - The type of file to upload ('image' or 'font')
     * @param formData - Form data containing the file to upload
     * @param storage - The target storage location for the file
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.uploadFile('image', formData, 'url');
     */
    async uploadFile(
        fileType: TFileType,
        formData: Parameters<Client['post']>[0]['data'],
        storage: TFileStorageType,
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

    /**
     * Removes a file from the camera storage.
     * @param fileType - The type of file to remove ('image' or 'font')
     * @param {TFile} fileParams - Parameters identifying the file to remove
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.removeFile('font', fontData);
     */
    async removeFile(fileType: TFileType, fileParams: TFile, options?: THttpRequestOptions) {
        await this._postUrlEncoded(
            `${BASE_PATH}/upload_${fileType}.cgi`,
            {
                action: 'remove',
                ...fileParams,
            },
            options,
            undefined
        );
    }

    /**
     * Retrieves storage information for a specific file type.
     * @param fileType - The type of file storage to query ('image' or 'font')
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to an array of storage data information
     * @throws {StorageDataFetchError} When the storage data cannot be fetched
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     * @example const storage = await coApi.getFileStorage('font');
     */
    async getFileStorage(fileType: TFileType, options?: THttpRequestOptions) {
        const res: TStorageResponse = await this._getJson(
            `${BASE_PATH}/upload_${fileType}.cgi`,
            { action: 'get_storage' },
            options
        );
        if (res.code !== 200) {
            throw new StorageDataFetchError(res);
        }
        return storageDataListSchema.parse(res.list);
    }

    /**
     * Downloads a file preview from the camera.
     * @param path - The path to the file on the camera
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to a Blob containing the file preview data
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {ParsingBlobError} When the response cannot be parsed as a Blob
     */
    async getFilePreviewFromCamera(path: string, options?: THttpRequestOptions) {
        return await this._getBlob(CamOverlayAPI.getFilePreviewPath(path), undefined, options);
    }

    //   ----------------------------------------
    //             CamOverlay services
    //   ----------------------------------------

    /**
     * Updates the text content of an Infoticker service.
     * @param serviceId - The unique identifier of the Infoticker service
     * @param text - The new text content to display
     * @param options - Optional HTTP request configuration option
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.updateInfoticker(2, 'Hello');
     */
    async updateInfoticker(serviceId: number, text: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/infoticker.cgi`, { service_id: serviceId, text: text }, options);
    }

    /**
     * Enables or disables a CamOverlay service.
     * @param serviceId - The unique identifier of the service
     * @param enabled - True to enable the service, false to disable it
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.setEnabled(1, true);
     */
    async setEnabled(serviceId: number, enabled: boolean, options?: THttpRequestOptions) {
        await this._post(`${BASE_PATH}/enabled.cgi`, '', { [`id_${serviceId}`]: enabled ? 1 : 0 }, options);
    }

    /**
     * Checks whether a specific service is currently enabled.
     * @param serviceId - The unique identifier of the service to check
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to true if the service is enabled, false otherwise
     * @throws {ServiceNotFoundError} When the service with the specified ID is not found
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example const isEnabled = await coApi.isEnabled(2);
     */
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

    /**
     * Returns the complete settings of the given CamOverlay service.
     * @param serviceId - The unique identifier of the service to retrieve
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to the parsed service data conforming to the services schema
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     * @example const service = await coApi.getSingleService(123);
     */
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

    /**
     * Returns the complete settings of all CamOverlay services.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to an array of all services
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async getServices(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/services.cgi`, { action: 'get' }, options);
        const services = serviceListSchema.parse(res).services;
        return services;
    }

    /**
     * Updates the configuration of a single service.
     * @param service - The service object with updated configuration
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     */
    async updateSingleService(service: TService, options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/services.cgi`,
            JSON.stringify(service),
            {
                action: 'set',
                service_id: service.id,
            },
            options,
            undefined
        );
    }

    /**
     * Changes the settings of all CamOverlay services.
     * @param services - Array of service objects with updated configurations
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     */
    async updateServices(services: TService[], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/services.cgi`,
            JSON.stringify({ services: services }),
            {
                action: 'set',
            },
            options,
            undefined
        );
    }

    //   ----------------------------------------
    //               Custom Graphics
    //   ----------------------------------------

    /**
     * Updates text fields in a Custom Graphics service.
     * @param serviceId - The unique identifier of the Custom Graphics service
     * @param fields - Array of field objects containing field name, text, and optional color
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.updateCGText(6, [{ text: 'Hello', field_name: 'field1', color: 'red' }]);
     */
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

    /**
     * Changes the position of Custom Graphics.
     * @param serviceId - The unique identifier of the Custom Graphics service
     * @param coordinates - The coordinate system to use (default: empty string)
     * @param x - The X coordinate position (default: 0)
     * @param y - The Y coordinate position (default: 0)
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.updateCGImagePos(4, 'top', 20, 5);
     */
    updateCGImagePos(serviceId: number, coordinates: TCoordinates = '', x = 0, y = 0, options?: THttpRequestOptions) {
        const params = {
            coord_system: coordinates,
            pos_x: x,
            pos_y: y,
        };
        return this.promiseCGUpdate(serviceId, 'update_image', params, undefined, undefined, options);
    }

    /**
     * Updates the Custom Graphics background to an image with the specified path on the camera. If no coordinates are specified, the service will use the positioning from the last update.
     * @param serviceId - The unique identifier of the Custom Graphics service
     * @param path - Path to the image file on the camera
     * @param coordinates - The coordinate system to use (default: empty string)
     * @param x - The X coordinate position (default: 0)
     * @param y - The Y coordinate position (default: 0)
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.updateCGImage(4, 'file:///path/to/image.png', 'bottom_right');
     */
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

    /**
     * Updates the Custom Graphics background to an image passed as the imageData argument. If no coordinates are specified, the service will use the positioning from the last update.
     * @param serviceId - The unique identifier of the Custom Graphics service
     * @param imageType - The type of image being uploaded (PNG or JPEG)
     * @param imageData - The raw image data to upload
     * @param coordinates - The coordinate system to use (default: empty string)
     * @param x - The X coordinate position (default: 0)
     * @param y - The Y coordinate position (default: 0)
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await coApi.updateCGImageFromData(9, 'PNG', data, 'bottom', 0, 0);
     */
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

    private async _getJson(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new ErrorWithResponse(res);
        }
    }
    private async _post(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({ path, data, parameters, headers, timeout: options?.timeout });
        if (res.ok) {
            return await res.json();
        } else {
            throw new ErrorWithResponse(res);
        }
    }

    private async _getBlob(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });
        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new ErrorWithResponse(res);
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
        parameters: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const data = paramToUrl(parameters);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post(path, data, undefined, options, { ...baseHeaders, ...headers });
    }

    private async _postJsonEncoded(
        path: string,
        data: string | Parameters<Client['post']>[0]['data'],
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return this._post(path, data, parameters, options, { ...baseHeaders, ...headers });
    }
}
