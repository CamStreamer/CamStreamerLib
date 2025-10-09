import { z } from 'zod';
import { IClient, TBlobResponse, TParameters, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';
import {
    blackListSchema,
    cameraSettingsSchema,
    flightInfoSchema,
    ICAO,
    mapInfoSchema,
    priorityListSchema,
    serverSettingsSchema,
    TApiUser,
    TBlackList,
    TExportDataType,
    TImportDataType,
    TPriorityList,
    trackingModeSchema,
    TTrackingMode,
    TWhiteList,
    TZones,
    whiteListSchema,
    zonesSchema,
} from './types/PlaneTrackerAPI';
import { ParsingBlobError } from './errors/errors';
import { THttpRequestOptions, TProxyParams } from './types/common';
import { ProxyClient } from './internal/ProxyClient';
import { cameraListSchema } from './types/GenetecAgent';

const BASE_PATH = '/local/planetracker';
export class PlaneTrackerAPI<Client extends IClient<TResponse, any>> {
    constructor(private client: Client, private apiUser: TApiUser) {}

    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;

    getClient(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.state);
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
        const res = await this._getJson(`${BASE_PATH}/package_camera_settings.cgi`, { action: 'get' }, options);
        return cameraSettingsSchema.parse(res);
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
        const res = await this._getJson(`${BASE_PATH}/package_server_settings.cgi`, { action: 'get' }, options);
        return serverSettingsSchema.parse(res);
    }

    async exportAppSettings(dataType: TExportDataType, options?: THttpRequestOptions) {
        return await this._getBlob(`${BASE_PATH}/package_data.cgi`, { action: 'EXPORT', dataType }, options);
    }

    async importAppSettings(
        dataType: TImportDataType,
        formData: Parameters<Client['post']>[0]['data'],
        options?: THttpRequestOptions
    ) {
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
        const res = await this._getJson(`${BASE_PATH}/package/flightInfo.cgi`, { icao }, options);
        return flightInfoSchema.parse(res);
    }

    async getTrackingMode(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getTrackingMode.cgi`, undefined, options);
        return trackingModeSchema.parse(res);
    }
    async setTrackingMode(mode: TTrackingMode['mode'], options?: THttpRequestOptions) {
        return await this._postJsonEncoded(`${BASE_PATH}/package/setTrackingMode.cgi`, { mode }, this.apiUser, options);
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
        const res = await this._getJson(`${BASE_PATH}/package/getPriorityList.cgi`, undefined, options);
        return priorityListSchema.parse(res);
    }
    async setPriorityList(priorityList: TPriorityList['priorityList'], options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setPriorityList.cgi`,
            { priorityList },
            this.apiUser,
            options
        );
    }

    async getWhiteList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getWhiteList.cgi`, undefined, options);
        return whiteListSchema.parse(res);
    }
    async setWhiteList(whiteList: TWhiteList['whiteList'], options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setWhiteList.cgi`,
            { whiteList },
            this.apiUser,
            options
        );
    }

    async getBlackList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getBlackList.cgi`, undefined, options);
        return blackListSchema.parse(res);
    }
    async setBlackList(blackList: TBlackList['blackList'], options?: THttpRequestOptions) {
        return await this._postJsonEncoded(
            `${BASE_PATH}/package/setBlackList.cgi`,
            { blackList },
            this.apiUser,
            options
        );
    }

    //   ----------------------------------------
    //                   Map & Zones
    //   ----------------------------------------

    async fetchMapInfo(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getMapInfo.cgi`, undefined, options);
        return mapInfoSchema.parse(res);
    }

    async getZones(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getZones.cgi`, undefined, options);
        return zonesSchema.parse(res);
    }

    async setZones(zones: TZones['zones'], options?: THttpRequestOptions) {
        return await this._postJsonEncoded(`${BASE_PATH}/package/setZones.cgi`, { zones }, this.apiUser, options);
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
        return await this._postUrlEncoded(`${BASE_PATH}/package/checkGenetecConnection.cgi`, '', params, options);
    }

    async getGenetecCameraList(params: TParameters, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(`${BASE_PATH}/package/getGenetecCameraList.cgi`, '', params, options);
        return cameraListSchema.parse(res);
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

    private async _getJson(
        path: string,
        parameters?: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout, headers });

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

    private async _getBlob(path: string, parameters?: TParameters, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({ path, parameters, timeout: options?.timeout });

        if (res.ok) {
            return await this.parseBlobResponse(res);
        } else {
            throw new Error(await responseStringify(res));
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
        data: string | Parameters<Client['post']>[0]['data'],
        parameters: TParameters,
        options?: THttpRequestOptions,
        headers?: Record<string, string>
    ) {
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this._post(path, data, parameters, options, { ...baseHeaders, ...headers });
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
