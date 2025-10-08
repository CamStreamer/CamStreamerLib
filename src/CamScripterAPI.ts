import { ProxyClient } from './internal/ProxyClient';
import { IClient, TParameters, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import {
    cameraTimeResponseSchema,
    camscripterApiResponseSchema,
    nodeStateSchema,
    packageInfoListSchema,
    storageSchema,
    TStorageType,
} from './types/CamScripterAPI';
import { networkCameraListSchema, THttpRequestOptions, TProxyParams } from './types/common';

const BASE_PATH = '/local/camscripter';
export class CamScripterAPI<Client extends IClient<TResponse, any>> {
    constructor(public client: Client) {}

    static getProxyUrlPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
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
        return storageSchema.parse(res);
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
        const res = await this._post(`${BASE_PATH}/package/install.cgi`, formData, { storage: storage }, options);
        return camscripterApiResponseSchema.parse(res);
    }

    async uninstallPackage(packageId: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/remove.cgi`, { package_name: packageId }, options);
        return camscripterApiResponseSchema.parse(res);
    }

    async importSettings(
        packageId: string,
        formData: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        const res = await this._post(
            `${BASE_PATH}/package/data.cgi`,
            formData,
            {
                action: 'IMPORT',
                package_name: packageId,
            },
            options
        );
        return camscripterApiResponseSchema.parse(res);
    }

    async exportSettings(
        packageId: string,
        formData: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
        const res = await this._post(
            `${BASE_PATH}/package/data.cgi`,
            formData,
            {
                action: 'EXPORT',
                package_name: packageId,
            },
            options
        );
        return camscripterApiResponseSchema.parse(res);
    }

    //   ----------------------------------------
    //                   Node.js
    //   ----------------------------------------

    async getNodejsStatus(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/diagnostics.cgi`, undefined, options);
        return nodeStateSchema.parse(res);
    }

    async installNodejs(storage: TStorageType, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/node_update.cgi`, { storage: storage }, options);
        return camscripterApiResponseSchema.parse(res);
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
            throw new Error(await responseStringify(res));
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
            throw new Error(await responseStringify(res));
        }
    }
}
