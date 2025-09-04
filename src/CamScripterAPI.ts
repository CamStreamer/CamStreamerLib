import { IClient, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

import {
    cameraTimeResponseSchema,
    camscripterApiResponseSchema,
    nodeStateSchema,
    packageInfoListSchema,
    storageSchema,
    TNodeState,
    TPackageInfoList,
    TStorage,
    TStorageType,
} from './types/CamScripterAPI';
import { networkCameraListSchema, TNetworkCamera } from './types/common';

export const BASE_URL = '/local/camscripter';
export class CamScripterAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(public client: Client) {}

    static getProxyUrlPath = () => `${BASE_URL}/proxy.cgi`;

    async checkCameraTime(): Promise<boolean> {
        const data = await this.get(`${BASE_URL}/camera_time.cgi`);
        return cameraTimeResponseSchema.parse(data).state;
    }

    async getNetworkCameraList(): Promise<TNetworkCamera[]> {
        const data = await this.get(`${BASE_URL}/network_camera_list.cgi`);
        return networkCameraListSchema.parse(data.camera_list);
    }

    //   ----------------------------------------
    //                   Packages
    //   ----------------------------------------

    async getStorageInfo(): Promise<TStorage> {
        const data = await this.get(`${BASE_URL}/package/get_storage.cgi`);
        return storageSchema.parse(data);
    }

    async getPackageList(): Promise<TPackageInfoList> {
        const data = await this.get(`${BASE_URL}/package/list.cgi`);
        return packageInfoListSchema.parse(data);
    }

    async installPackages(formData: FormData, storage: TStorageType) {
        const data = await this.post(`${BASE_URL}/package/install.cgi?storage=${storage}`, formData);
        return camscripterApiResponseSchema.parse(data);
    }

    async uninstallPackage(packageId: string) {
        const data = await this.get(`${BASE_URL}/package/remove.cgi?package_name=${packageId}`);
        return camscripterApiResponseSchema.parse(data);
    }

    async importSettings(packageId: string, formData: FormData) {
        const data = await this.post(`${BASE_URL}/package/data.cgi?action=IMPORT&package_name=${packageId}`, formData);
        return camscripterApiResponseSchema.parse(data);
    }

    async exportSettings(packageId: string, formData: FormData) {
        const data = await this.post(`${BASE_URL}/package/data.cgi?action=EXPORT&package_name=${packageId}`, formData);
        return camscripterApiResponseSchema.parse(data);
    }

    //   ----------------------------------------
    //                   Node.js
    //   ----------------------------------------

    async getNodejsStatus(): Promise<TNodeState> {
        const data = await this.get(`${BASE_URL}/diagnostics.cgi`);
        return nodeStateSchema.parse(data);
    }

    async installNodejs(storage: TStorageType) {
        const data = await this.get(`${BASE_URL}/node_update.cgi?storage=${storage}`);
        return camscripterApiResponseSchema.parse(data);
    }

    private async get(path: string, params?: Record<string, string>): Promise<any> {
        const res = await this.client.get(path, params);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async post(path: string, data: string | Buffer | FormData, params?: Record<string, string>): Promise<any> {
        const res = await this.client.post(path, data, params);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
