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

    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkAPIAvailable(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/api_check.cgi`, undefined, options);
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return cameraTimeResponseSchema.parse(res).state;
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(res.camera_list);
    }

    //   ----------------------------------------
    //                   Packages
    //   ----------------------------------------

    async getStorageInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/get_storage.cgi`, undefined, options);
        return cameraStorageSchema.parse(res);
    }

    async getPackageList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/list.cgi`, undefined, options);
        return packageInfoListSchema.parse(res);
    }

    async installPackages(
        formData: Parameters<Client['post']>[0]['data'],
        storage: TStorageType,
        options?: THttpRequestOptions
    ) {
        await this._post(`${BASE_PATH}/package/install.cgi`, formData, { storage: storage }, options);
    }

    async uninstallPackage(packageId: string, options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/package/remove.cgi`, { package_name: packageId }, options);
    }

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

    async getNodejsStatus(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/diagnostics.cgi`, undefined, options);
        return nodeStateSchema.parse(res);
    }

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
