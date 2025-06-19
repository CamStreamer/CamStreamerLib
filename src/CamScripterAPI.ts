import { IClient, isClient, responseStringify, TNetworkCameraList } from './internal/common';
import { DefaultAgent } from './DefaultAgent';
import { CamScripterOptions, TNodeState, TPackageInfoList, TStorage, TStorageType } from './types/CamScripterAPI';

export class CamOverlayAPI {
    private client: IClient;

    constructor(options: CamScripterOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    async checkCameraTime(): Promise<boolean> {
        return (await this.get('/local/camscripter/camera_time.cgi')).state;
    }

    async getStorageInfo(): Promise<TStorage> {
        return await this.get(`/local/camscripter/package/get_storage.cgi`);
    }

    async getNetworkCameraList(): Promise<TNetworkCameraList> {
        return (await this.get('/local/camscripter/network_camera_list.cgi')).camera_list;
    }

    //   ----------------------------------------
    //                   Packages
    //   ----------------------------------------

    async getPackageList(): Promise<TPackageInfoList> {
        return await this.get('/local/camscripter/package/list.cgi');
    }

    async installPackages(formData: FormData, storage: TStorageType): Promise<void> {
        await this.post(`/local/camscripter/package/install.cgi?storage=${storage}`, formData);
    }

    async uninstallPackage(packageId: string): Promise<void> {
        await this.get(`/local/camscripter/package/remove.cgi?package_name=${packageId}`);
    }

    async importSettings(packageId: string, formData: FormData): Promise<void> {
        await this.post(`/local/camscripter/package/data.cgi?action=IMPORT&package_name=${packageId}`, formData);
    }

    async exportSettings(packageId: string, formData: FormData): Promise<void> {
        await this.post(`/local/camscripter/package/data.cgi?action=EXPORT&package_name=${packageId}`, formData);
    }

    //   ----------------------------------------
    //                   Node.js
    //   ----------------------------------------

    async getNodejsStatus(): Promise<TNodeState> {
        return (await this.get('/local/camscripter/diagnostics.cgi')).node_state;
    }

    async installNodejs(storage: TStorageType): Promise<void> {
        await this.get(`/local/camscripter/node_update.cgi?storage=${storage}`);
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
