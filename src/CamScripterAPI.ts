import { ErrorWithResponse } from './errors/errors';
import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';

import {
    cameraTimeResponseSchema,
    nodeStateSchema,
    packageInfoListSchema,
    cameraStorageSchema,
} from './types/CamScripterAPI';
import { networkCameraListSchema, THttpRequestOptions, TProxyParams, TStorageType } from './types/common';

const BASE_PATH = '/local/camscripter';
export class CamScripterAPI<Client extends IClient<TResponse, any>> {
    constructor(private client: Client) {}

    /**
     * Gets the relative path to proxy.cgi endpoint.
     * @returns The proxy path string
     */
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;

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
        return cameraTimeResponseSchema.parse(res).state;
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

    //   ----------------------------------------
    //                   Packages
    //   ----------------------------------------

    /**
     * Get information on available storage and it's capacity in MB.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to storage information
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async getStorageInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/get_storage.cgi`, undefined, options);
        return cameraStorageSchema.parse(res);
    }

    /**
     * Get list of all installed packages.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to an array of installed packages data
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async getPackageList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/list.cgi`, undefined, options);
        return packageInfoListSchema.parse(res);
    }

    /**
     * Install packages on the camera.
     * @param formData - Form data containing the packages to install
     * @param storage - The target storage location for the packages ('FLASH' | 'SD_DISK')
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await cscApi.installPackages(data, 'SD_DISK');
     */
    async installPackages(
        formData: Parameters<Client['post']>[0]['data'],
        storage: TStorageType,
        options?: THttpRequestOptions
    ) {
        await this._post(`${BASE_PATH}/package/install.cgi`, formData, { storage: storage }, options);
    }

    /**
     * Uninstall a package from the camera.
     * @param packageId - The name of the package to uninstall
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await cscApi.uninstallPackage('video_checkpoint');
     */
    async uninstallPackage(packageId: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/package/remove.cgi`, { package_name: packageId }, options);
    }

    /**
     * Imports package settings.
     * @param packageId - The name of the package to import
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await cscApi.importSettings('video_checkpoint', data);
     */
    async importSettings(
        packageId: string,
        formData: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        await this._post(
            `${BASE_PATH}/package/data.cgi`,
            formData,
            {
                action: 'IMPORT',
                package_name: packageId,
            },
            options
        );
    }

    /**
     * Exports package settings.
     * @param packageId - The name of the package to export
     * @param options - Optional HTTP request configuration options
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await cscApi.exportSettings('video_checkpoint', data);
     */
    async exportSettings(
        packageId: string,
        formData: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        await this._post(
            `${BASE_PATH}/package/data.cgi`,
            formData,
            {
                action: 'EXPORT',
                package_name: packageId,
            },
            options
        );
    }

    //   ----------------------------------------
    //                   Node.js
    //   ----------------------------------------

    /**
     * Get Node.js diagnostics information.
     * @param options - Optional HTTP request configuration options
     * @returns Promise resolving to Node.js status information:
        'OK' - Node.js is installed and functioning properly,
        'NOT_INSTALLED' - Node.js is not installed on the camera,
        'NOT_FOUND' - Node.js installation files are missing or corrupted
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @throws {Error} When the response doesn't match the expected schema
     */
    async getNodejsStatus(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/diagnostics.cgi`, undefined, options);
        return nodeStateSchema.parse(res);
    }

    /**
     * Decompress bundled NodeJS gzip file into chosen location, which is then stored in NodejsLocation parameter.
     * @param storage - The target storage location for Node.js ('FLASH' | 'SD_DISK')
     * @throws {ErrorWithResponse} When the HTTP request fails
     * @example await cscApi.installNodejs('FLASH');
     */
    async installNodejs(storage: TStorageType, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/node_update.cgi`, { storage: storage }, options);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

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
}
