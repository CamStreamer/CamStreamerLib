import { z } from 'zod';
import { IClient, TResponse } from './internal/types';
import { responseStringify } from './internal/utils';

type ICAO = string;
export const BASE_URL = '/local/planetracker';
export class PlaneTrackerAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(private client: Client) {}

    static getProxyUrlPath = () => `${BASE_URL}/proxy.cgi`;

    async checkCameraTime() {
        const responseSchema = z.discriminatedUnion('state', [
            z.object({
                state: z.literal(true),
                code: z.number(),
            }),
            // Error response
            z.object({
                state: z.literal(false),
                code: z.number(),
                reason: z.union([
                    z.literal('INVALID_TIME'),
                    z.literal('COULDNT_RESOLVE_HOST'), // NOTE: typo on server already
                    z.literal('CONNECTION_ERROR'),
                ]),
                message: z.string(),
            }),
        ]);

        const response = await this._get<z.infer<typeof responseSchema>>(`${BASE_URL}/camera_time.cgi`);
        const cameraTime = responseSchema.parse(response);

        if (!cameraTime.state) {
            // create logger
            console.error(`Camera time check failed: ${cameraTime.reason} - ${cameraTime.message}`);
        }

        return cameraTime.state;
    }

    fetchCameraSettings = async () => {
        return await this._get(`${BASE_URL}/package_camera_settings.cgi?action=get`);
    };

    fetchServerSettings = async () => {
        return await this._get(`${BASE_URL}/package_server_settings.cgi?action=get`);
    };

    fetchMapInfo = async () => {
        return await this._get(`${BASE_URL}/package/getMapInfo.cgi`);
    };

    fetchFlightInfo = async (icao: ICAO) => {
        return await this._get(`${BASE_URL}/package/flightInfo.cgi?icao=${icao}`);
    };

    getZones = async () => {
        return await this._get(`${BASE_URL}/package/getZones.cgi`);
    };

    setZones = async (zonesJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setZones.cgi`, zonesJsonString);
    };

    getPriorityList = async () => {
        return await this._get(`${BASE_URL}/package/getPriorityList.cgi`);
    };
    setPriorityList = async (priorityListJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setPriorityList.cgi`, priorityListJsonString);
    };

    getWhiteList = async () => {
        return await this._get(`${BASE_URL}/package/getWhiteList.cgi`);
    };
    setWhiteList = async (whiteListJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setWhiteList.cgi`, whiteListJsonString);
    };

    getBlackList = async () => {
        return await this._get(`${BASE_URL}/package/getBlackList.cgi`);
    };
    setBlackList = async (blackListJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setBlackList.cgi`, blackListJsonString);
    };

    getTrackingMode = async () => {
        return await this._get(`${BASE_URL}/package/getTrackingMode.cgi`);
    };
    setTrackingMode = async (modeJsonString: string) => {
        return await this._postJsonEncoded(`${BASE_URL}/package/setTrackingMode.cgi`, modeJsonString);
    };

    startTrackingPlane = async (icao: ICAO) => {
        return await this.client.get(`${BASE_URL}/package/trackIcao.cgi?icao=${icao}`);
    };

    stopTrackingPlane = async () => {
        return await this.client.get(`${BASE_URL}/package/resetIcao.cgi`);
    };

    goToCoordinates = async (lat: number, lon: number, alt?: number) => {
        const url = `${BASE_URL}/package/goToCoordinates.cgi?lat=${lat}&lon=${lon}`;
        return await this.client.get(`${url}${alt !== undefined ? `&alt=${alt}` : ''}`);
    };

    private async _get<TResponseData = any>(
        ...args: Parameters<IClient<TResponse>['get']>
    ): Promise<TResponseData> | never {
        const res = await this.client.get(...args);

        if (res.ok) {
            return (await res.json()) as TResponseData;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
    private async _post<TResponseData = any>(
        ...args: Parameters<IClient<TResponse>['post']>
    ): Promise<TResponseData> | never {
        const res = await this.client.post(...args);

        if (res.ok) {
            return (await res.json()) as TResponseData;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    private async _postJsonEncoded<TResponseData = any>(
        ...args: Parameters<IClient<TResponse>['post']>
    ): Promise<TResponseData> | never {
        const [path, data, params, headers] = args;
        const baseHeaders = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
        return this._post(path, data, params, { ...baseHeaders, ...headers });
    }
}
