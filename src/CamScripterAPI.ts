import { ProxyClient } from './internal/ProxyClient';
import { IClient, TResponse } from './internal/types';
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
export class CamScripterAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(public client: Client) {}

    static getProxyUrlPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return cameraTimeResponseSchema.parse(data).state;
    }

    async getNetworkCameraList(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/network_camera_list.cgi`, undefined, options);
        return networkCameraListSchema.parse(data.camera_list);
    }

    //   ----------------------------------------
    //                   Packages
    //   ----------------------------------------

    async getStorageInfo(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/package/get_storage.cgi`, undefined, options);
        return storageSchema.parse(data);
    }

    async getPackageList(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/package/list.cgi`, undefined, options);
        return packageInfoListSchema.parse(data);
    }

    async installPackages(formData: FormData, storage: TStorageType, options?: THttpRequestOptions) {
        const data = await this.post(
            `${BASE_PATH}/package/install.cgi?storage=${storage}`,
            formData,
            undefined,
            options
        );
        return camscripterApiResponseSchema.parse(data);
    }

    async uninstallPackage(packageId: string, options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/package/remove.cgi?package_name=${packageId}`, undefined, options);
        return camscripterApiResponseSchema.parse(data);
    }

    async importSettings(packageId: string, formData: FormData, options?: THttpRequestOptions) {
        const data = await this.post(
            `${BASE_PATH}/package/data.cgi?action=IMPORT&package_name=${packageId}`,
            formData,
            undefined,
            options
        );
        return camscripterApiResponseSchema.parse(data);
    }

    async exportSettings(packageId: string, formData: FormData, options?: THttpRequestOptions) {
        const data = await this.post(
            `${BASE_PATH}/package/data.cgi?action=EXPORT&package_name=${packageId}`,
            formData,
            undefined,
            options
        );
        return camscripterApiResponseSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Node.js
    //   ----------------------------------------

    async getNodejsStatus(options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/diagnostics.cgi`, undefined, options);
        return nodeStateSchema.parse(data);
    }

    async installNodejs(storage: TStorageType, options?: THttpRequestOptions) {
        const data = await this.get(`${BASE_PATH}/node_update.cgi?storage=${storage}`, undefined, options);
        return camscripterApiResponseSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async get(path: string, parameters?: Record<string, string>, options?: THttpRequestOptions): Promise<any> {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async post(
        path: string,
        data: string | Buffer | FormData,
        parameters?: Record<string, string>,
        options?: THttpRequestOptions
    ): Promise<any> {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({ path, data, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
