import { z } from 'zod';
import { IClient, TParameters, TResponse } from './internal/types';
import {
    blackListSchema,
    cameraSettingsSchema,
    flightInfoSchema,
    getIcaoSchema,
    ICAO,
    mapInfoSchema,
    priorityListSchema,
    serverSettingsSchema,
    TApiUser,
    TBlackList,
    TCameraSettings,
    TExportDataType,
    TGetIcaoByOption,
    TImportDataType,
    TPriorityList,
    trackingModeSchema,
    TTrackingMode,
    TTypePriorityList,
    TWhiteList,
    typePriorityListSchema,
    TZones,
    whiteListSchema,
    wsAliasResponseSchema,
    zonesSchema,
} from './types/PlaneTrackerAPI';
import {
    CannotSetCoordsInAutoModeError,
    ImportSettingsError,
    InvalidAltitudeError,
    InvalidLatLngError,
    ResetCalibrationError,
    ServerError,
    BadRequestError,
} from './errors/errors';
import { THttpRequestOptions } from './types/common';
import { cameraListSchema } from './types/GenetecAgent';
import { BasicAPI } from './internal/BasicAPI';

const BASE_PATH = '/local/planetracker';
export class PlaneTrackerAPI<Client extends IClient<TResponse, any>> extends BasicAPI<Client> {
    constructor(client: Client, private apiUser: TApiUser) {
        super(client);
    }

    static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
    static getWsEventsPath = () => `${BASE_PATH}/package/ws`;

    async checkAPIAvailable(options?: THttpRequestOptions) {
        await this._getJson(`${BASE_PATH}/api_check.cgi`, undefined, options);
    }

    async checkCameraTime(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, undefined, options);
        return z.boolean().parse(res.state);
    }

    async serverRunCheck(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/package/serverRunCheck.cgi`,
            timeout: options?.timeout,
        });
        return res.status === 200;
    }

    async getLiveViewAlias(rtspUrl: string, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/getLiveViewAlias.cgi`,
            parameters: { rtsp_url: rtspUrl },
            timeout: options?.timeout,
        });
        return wsAliasResponseSchema.parse(await res.json());
    }

    //   ----------------------------------------
    //                 Calibration
    //   ----------------------------------------

    async resetPtzCalibration(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/package/resetPtzCalibration.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
        if (!res.ok) {
            throw new ResetCalibrationError('PTZ', res);
        }
    }

    async resetFocusCalibration(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/package/resetFocusCalibration.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
        if (!res.ok) {
            throw new ResetCalibrationError('FOCUS', res);
        }
    }

    //   ----------------------------------------
    //                   Settings
    //   ----------------------------------------

    async fetchCameraSettings(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package_camera_settings.cgi`, { action: 'get' }, options);
        return cameraSettingsSchema.parse(res);
    }
    async setCameraSettings(settings: TCameraSettings, options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/package_camera_settings.cgi`,
            settings,
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
        const res = await agent.post({
            path: `${BASE_PATH}/package_data.cgi`,
            data: formData,
            parameters: { action: 'IMPORT', dataType },
            timeout: options?.timeout,
        });

        if (!res.ok) {
            throw new ImportSettingsError(res);
        }
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
        await this._postJsonEncoded(`${BASE_PATH}/package/setTrackingMode.cgi`, { mode }, this.apiUser, options);
    }

    async startTrackingPlane(icao: ICAO, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        await agent.get({
            path: `${BASE_PATH}/package/trackIcao.cgi`,
            parameters: { icao, ...this.apiUser },
            timeout: options?.timeout,
        });
    }

    async stopTrackingPlane(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        await agent.get({
            path: `${BASE_PATH}/package/resetIcao.cgi`,
            parameters: this.apiUser,
            timeout: options?.timeout,
        });
    }

    async getIcao(by: TGetIcaoByOption, value: string, options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getIcao.cgi`, { [by]: value }, options);
        return getIcaoSchema.parse(res).icao;
    }

    //   ----------------------------------------
    //                   Lists
    //   ----------------------------------------

    async getPriorityList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getPriorityList.cgi`, undefined, options);
        return priorityListSchema.parse(res).priorityList;
    }
    async setPriorityList(priorityList: TPriorityList['priorityList'], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/package/setPriorityList.cgi`,
            { priorityList },
            this.apiUser,
            options
        );
    }

    async getTypePriorityList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getTypePriorityList.cgi`, undefined, options);
        return typePriorityListSchema.parse(res).typePriorityList;
    }
    async setTypePriorityList(typePriorityList: TTypePriorityList['typePriorityList'], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
            `${BASE_PATH}/package/setTypePriorityList.cgi`,
            { typePriorityList },
            this.apiUser,
            options
        );
    }

    async getWhiteList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getWhiteList.cgi`, undefined, options);
        return whiteListSchema.parse(res).whiteList;
    }
    async setWhiteList(whiteList: TWhiteList['whiteList'], options?: THttpRequestOptions) {
        await this._postJsonEncoded(`${BASE_PATH}/package/setWhiteList.cgi`, { whiteList }, this.apiUser, options);
    }

    async getBlackList(options?: THttpRequestOptions) {
        const res = await this._getJson(`${BASE_PATH}/package/getBlackList.cgi`, undefined, options);
        return blackListSchema.parse(res).blackList;
    }
    async setBlackList(blackList: TBlackList['blackList'], options?: THttpRequestOptions) {
        await this._postJsonEncoded(`${BASE_PATH}/package/setBlackList.cgi`, { blackList }, this.apiUser, options);
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

    async setZones(zones: TZones, options?: THttpRequestOptions) {
        await this._postJsonEncoded(`${BASE_PATH}/package/setZones.cgi`, zones, this.apiUser, options);
    }

    async goToCoordinates(lat: number, lon: number, alt?: number, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: `${BASE_PATH}/package/goToCoordinates.cgi`,
            parameters: { lat, lon, alt, ...this.apiUser },
            timeout: options?.timeout,
        });

        if (!res.ok) {
            if (res.status === 400 && res.statusText === 'Cannot set coordinates in automatic mode') {
                throw new CannotSetCoordsInAutoModeError();
            }
            if (res.status === 400 && res.statusText === 'Invalid lat/lon parameters') {
                throw new InvalidLatLngError();
            }
            if (res.status === 400 && res.statusText === 'Invalid alt parameter') {
                throw new InvalidAltitudeError();
            }
            if (res.status === 400) {
                throw new BadRequestError(res);
            }
            if (res.status === 500) {
                throw new ServerError();
            }
        }
    }

    //   ----------------------------------------
    //                   Report
    //   ----------------------------------------

    downloadReport(options?: THttpRequestOptions) {
        return this._getText(`${BASE_PATH}/report.cgi`, undefined, options);
    }

    //   ----------------------------------------
    //                   Genetec
    //   ----------------------------------------

    async checkGenetecConnection(params: TParameters, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(`${BASE_PATH}/package/checkGenetecConnection.cgi`, params, options);
        return res.status === 200;
    }

    async getGenetecCameraList(params: TParameters, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(`${BASE_PATH}/package/getGenetecCameraList.cgi`, params, options);
        return cameraListSchema.parse(await res.json());
    }
}
