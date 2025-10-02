import { z } from 'zod';
import { IClient, TBlobResponse, TParameters, TResponse } from './internal/types';
import { paramToUrl, responseStringify } from './internal/utils';
import {
    blackListSchema,
    cameraSettingsSchema,
    flightInfoSchema,
    ICAO,
    mapInfoSchema,
    priorityListSchema,
    serverSettingsSchema,
    TApiUser,
    TExportDataType,
    TImportDataType,
    trackingModeSchema,
    whiteListSchema,
    zonesSchema,
} from './types/PlaneTrackerAPI';
import { ParsingBlobError } from './errors/errors';
import { THttpRequestOptions, TProxyParams } from './types/common';
import { ProxyClient } from './internal/ProxyClient';
import { cameraListSchema } from './node';

const BASE_PATH = '/local/planetracker';
export class PlaneTrackerAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(private client: Client, private apiUser: TApiUser) {}

    static getProxyUrlPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const response = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(response.state);
    }

    async resetPtzCalibration(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/package/resetPtzCalibration.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
    }

    async resetFocusCalibration(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/package/resetFocusCalibration.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
    }

    async serverRunCheck(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({ path: `${BASE_PATH}/package/serverRunCheck.cgi`, timeout: options?.timeout });
    }

    async getLiveViewAlias(rtspUrl: string, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/getLiveViewAlias.cgi`,
            parameters: { rtsp_url: rtspUrl },
            timeout: options?.timeout,
        });
    }

    //   ----------------------------------------
    //                   Settings
    //   ----------------------------------------

    async fetchCameraSettings(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package_camera_settings.cgi`, { action: 'get' }, options);
        return cameraSettingsSchema.parse(data);
    }
    async setCameraSettings(settingsJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package_camera_settings.cgi`,
            settingsJsonString,
            {
                action: 'set',
            },
            options
        );
    }

    async fetchServerSettings(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package_server_settings.cgi`, { action: 'get' }, options);
        return serverSettingsSchema.parse(data);
    }

    async exportAppSettings(dataType: TExportDataType, options?: THttpRequestOptions) {
        return await this._getBlob(`${BASE_PATH}/package_data.cgi`, { action: 'EXPORT', dataType }, options);
    }

    async importAppSettings(dataType: TImportDataType, formData: FormData, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.post({
            path: `${BASE_PATH}/package_data.cgi`,
            data: formData,
            parameters: { action: 'IMPORT', dataType },
            timeout: options?.timeout,
        });
    }

    //   ----------------------------------------
    //             Planes & Tracking
    //   ----------------------------------------

    async fetchFlightInfo(icao: ICAO, options?: THttpRequestOptions) {
        const data = await this._getJson(
            `${BASE_PATH}/package/flightInfo.cgi`,
            { icao: encodeURIComponent(icao) },
            options
        );
        return flightInfoSchema.parse(data);
    }

    async getTrackingMode(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getTrackingMode.cgi`, undefined, options);
        return trackingModeSchema.parse(data);
    }
    async setTrackingMode(modeJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setTrackingMode.cgi`,
            modeJsonString,
            this.apiUser,
            options
        );
    }

    async startTrackingPlane(icao: ICAO, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/package/trackIcao.cgi`,
            parameters: { icao, ...this.apiUser },
            timeout: options?.timeout,
        });
    }

    async stopTrackingPlane(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/package/resetIcao.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
    }

    //   ----------------------------------------
    //                   Lists
    //   ----------------------------------------

    async getPriorityList(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getPriorityList.cgi`, undefined, options);
        return priorityListSchema.parse(data);
    }
    async setPriorityList(priorityListJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setPriorityList.cgi`,
            priorityListJsonString,
            this.apiUser,
            options
        );
    }

    async getWhiteList(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getWhiteList.cgi`, undefined, options);
        return whiteListSchema.parse(data);
    }
    async setWhiteList(whiteListJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setWhiteList.cgi`,
            whiteListJsonString,
            this.apiUser,
            options
        );
    }

    async getBlackList(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getBlackList.cgi`, undefined, options);
        return blackListSchema.parse(data);
    }
    async setBlackList(blackListJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setBlackList.cgi`,
            blackListJsonString,
            this.apiUser,
            options
        );
    }

    //   ----------------------------------------
    //                   Map & Zones
    //   ----------------------------------------

    async fetchMapInfo(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getMapInfo.cgi`, undefined, options);
        return mapInfoSchema.parse(data);
    }

    async getZones(options?: THttpRequestOptions) {
        const data = await this._getJson(`${BASE_PATH}/package/getZones.cgi`, undefined, options);
        return zonesSchema.parse(data);
    }

    async setZones(zonesJsonString: string, options?: THttpRequestOptions) {
        return await this._postJsonEncoded(`${BASE_PATH}/package/setZones.cgi`, zonesJsonString, this.apiUser, options);
    }

    async goToCoordinates(lat: number, lon: number, alt?: number, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return await agent.get({
            path: `${BASE_PATH}/package/goToCoordinates.cgi`,
            parameters: { lat, lon, alt, ...this.apiUser },
            timeout: options?.timeout,
        });
    }

    //   ----------------------------------------
    //                   Genetec
    //   ----------------------------------------

    async checkGenetecConnection(params: TParameters, options?: THttpRequestOptions) {
        return await this._postUrlEncoded(`${BASE_PATH}/package/checkGenetecConnection.cgi`, params, options);
    }

    async getGenetecCameraList(params: TParameters, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(`${BASE_PATH}/package/getGenetecCameraList.cgi`, params, options);
        return cameraListSchema.parse(await res.json());
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async _getJson(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path,
            parameters,
            timeout: options?.timeout,
        });

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _getBlob(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path,
            parameters,
            timeout: options?.timeout,
        });

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

    private async _postJsonEncoded(
        path: string,
        data: string | Buffer | FormData,
        parameters?: TParameters,
        options?: THttpRequestOptions
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path,
            data,
            parameters,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: options?.timeout,
        });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _postUrlEncoded(path: string, params: TParameters, options?: THttpRequestOptions) {
        const data = paramToUrl(params);
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path,
            data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: options?.timeout,
        });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
