import { BasicAPI } from './internal/BasicAPI';
import { IClient, TResponse } from './internal/types';

import {
    cameraTimeResponseSchema,
    nodeStateSchema,
    packageInfoListSchema,
    cameraStorageSchema,
} from './types/CamScripterAPI';
import { networkCameraListSchema, THttpRequestOptions, TStorageType } from './types/common';

const BASE_PATH = '/local/camscripter';
export class CamScripterAPI<Client extends IClient<TResponse, any>> extends BasicAPI<Client> {
    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;

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
}
