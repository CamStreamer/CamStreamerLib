import { z } from 'zod';
import { IClient, TBlobResponse, TGetParams, TParameters, TResponse } from './internal/types';
import { paramToUrl, responseStringify } from './internal/utils';
import { TExportDataType, TImportDataType } from './types/PlaneTrackerAPI';
import { ParsingBlobError } from './errors/errors';

export type TApiUser = {
    userId: string;
    userName: string;
    userPriority: number;
};

type ICAO = string;
export const BASE_URL = '/local/planetracker';
export class PlaneTrackerAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    private _apiUserQuery: string;

    constructor(private client: Client, private apiUser: TApiUser) {
        this._apiUserQuery = paramToUrl(this.apiUser);
    }

    static getProxyUrlPath = () => `${BASE_URL}/proxy.cgi`;

    async checkCameraTime() {
        const response = await this._getJson(`${BASE_URL}/camera_time.cgi`);
        return z.boolean().parse(response.state);
    }

    fetchCameraSettings = async () => {
        return await this._getJson(`${BASE_URL}/package_camera_settings.cgi`, { action: 'get' });
    };
    setCameraSettings = async (settingsJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package_camera_settings.cgi`, settingsJsonString, {
            action: 'set',
        });
    };

    fetchServerSettings = async () => {
        return await this._getJson(`${BASE_URL}/package_server_settings.cgi`, { action: 'get' });
    };

    fetchMapInfo = async () => {
        return await this._getJson(`${BASE_URL}/package/getMapInfo.cgi`);
    };

    fetchFlightInfo = async (icao: ICAO) => {
        return await this._getJson(`${BASE_URL}/package/flightInfo.cgi`, { icao: encodeURIComponent(icao) });
    };

    getZones = async () => {
        return await this._getJson(`${BASE_URL}/package/getZones.cgi`);
    };

    setZones = async (zonesJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setZones.cgi?${this._apiUserQuery}`, zonesJsonString);
    };

    getPriorityList = async () => {
        return await this._getJson(`${BASE_URL}/package/getPriorityList.cgi`);
    };
    setPriorityList = async (priorityListJsonString: string) => {
        return await this._postJsonEncoded(
            `${BASE_URL}/package/setPriorityList.cgi?${this._apiUserQuery}`,
            priorityListJsonString
        );
    };

    getWhiteList = async () => {
        return await this._getJson(`${BASE_URL}/package/getWhiteList.cgi`);
    };
    setWhiteList = async (whiteListJsonString: string) => {
        return await this._postJsonEncoded(
            `${BASE_URL}/package/setWhiteList.cgi?${this._apiUserQuery}`,
            whiteListJsonString
        );
    };

    getBlackList = async () => {
        return await this._getJson(`${BASE_URL}/package/getBlackList.cgi`);
    };
    setBlackList = async (blackListJsonString: string) => {
        return await this._postJsonEncoded(
            `${BASE_URL}/package/setBlackList.cgi?${this._apiUserQuery}`,
            blackListJsonString
        );
    };

    getTrackingMode = async () => {
        return await this._getJson(`${BASE_URL}/package/getTrackingMode.cgi`);
    };
    setTrackingMode = async (modeJsonString: string) => {
        return await this._postJsonEncoded(
            `${BASE_URL}/package/setTrackingMode.cgi?${this._apiUserQuery}`,
            modeJsonString
        );
    };

    startTrackingPlane = async (icao: ICAO) => {
        return await this.client.get(
            `${BASE_URL}/package/trackIcao.cgi?icao=${encodeURIComponent(icao)}&${this._apiUserQuery}`
        );
    };

    stopTrackingPlane = async () => {
        return await this.client.get(`${BASE_URL}/package/resetIcao.cgi?${this._apiUserQuery}`);
    };

    goToCoordinates = async (lat: number, lon: number, alt?: number) => {
        const url = `${BASE_URL}/package/goToCoordinates.cgi?lat=${lat}&lon=${lon}&${this._apiUserQuery}`;
        return await this.client.get(`${url}${alt !== undefined ? `&alt=${alt}` : ''}`);
    };

    exportAppSettings = async (dataType: TExportDataType) => {
        return await this._getBlob(`${BASE_URL}/package_data.cgi`, { action: 'EXPORT', dataType });
    };

    importAppSettings = async (dataType: TImportDataType, formData: FormData) => {
        return await this.client.post(`${BASE_URL}/package_data.cgi`, formData, { action: 'IMPORT', dataType });
    };

    resetPtzCalibration = async () => {
        return await this.client.get(`${BASE_URL}/package/resetPtzCalibration.cgi?${this._apiUserQuery}`);
    };

    resetFocusCalibration = async () => {
        return await this.client.get(`${BASE_URL}/package/resetFocusCalibration.cgi?${this._apiUserQuery}`);
    };

    checkGenetecConnection = async (params: TParameters) => {
        return await this._postUrlEncoded(`${BASE_URL}/package/checkGenetecConnection.cgi`, params);
    };

    getGenetecCameraList = async (params: TParameters) => {
        const res = await this._postUrlEncoded(`${BASE_URL}/package/getGenetecCameraList.cgi`, params);
        return await res.json();
    };

    serverRunCheck = async () => {
        return await this.client.get(`${BASE_URL}/package/serverRunCheck.cgi`);
    };

    private async _getJson(...args: Parameters<IClient<TResponse>['get']>) {
        const res = await this.client.get(...args);

        if (res.ok) {
            return await res.json();
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _getBlob(...args: TGetParams) {
        const res = await this.client.get(...args);

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

    private async _postJsonEncoded(...args: Parameters<IClient<TResponse>['post']>) {
        const [path, data, params, headers] = args;
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        const res = await this.client.post(path, data, params, { ...baseHeaders, ...headers });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _postUrlEncoded(path: string, params: TParameters, headers?: Record<string, string>) {
        const data = paramToUrl(params);
        const baseHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const res = await this.client.post(path, data, {}, { ...baseHeaders, ...headers });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
