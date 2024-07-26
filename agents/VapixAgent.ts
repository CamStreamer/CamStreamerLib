import { Logger } from 'dap-utils/Logger/Logger';
import { XMLParser } from 'fast-xml-parser';

import { TSDCardInfo } from 'AgentFactoryProvider/types/AcapReact';
import { TCameraPTZItem, TCameraPTZItemData, TPtzOverview } from 'AgentFactoryProvider/types/CSw/Camera';
import { TCameraSupportedAudioSampleRates } from 'AgentFactoryProvider/types/CSw/MasterCamera';

import { arrayToUrl, parseCameraPTZfromReq } from './Clients/utils';

import type { ProxyClient, TProxyParam } from './Client';
export class VapixAgent {
    protected _baseAddress = '/axis-cgi';

    constructor(private client: ProxyClient, private logger: Logger) {}

    async getParametr(paramNames: string | string[], proxy: TProxyParam = null): Promise<Record<string, string>> {
        const url = `${this._baseAddress}/param.cgi`;

        const res = await this.client.fetchPostUrlEncoded(proxy, url, {
            action: 'list',
            group: arrayToUrl(paramNames),
        });

        return this.parseGetParametrs(res);
    }

    async setParametr(params: Record<string, string | number>, proxy: TProxyParam = null): Promise<boolean> {
        try {
            const url = '/axis-cgi/param.cgi';
            params['action'] = 'update';
            const res = await this.client.fetchPostUrlEncoded(proxy, url, params);
            return this.checkResultForError(res, 'setParametr', JSON.stringify(params));
        } catch (e) {
            return false;
        }
    }

    async getSupportedAudioSampleRate(proxy: TProxyParam = null): Promise<TCameraSupportedAudioSampleRates[]> {
        const url = `${this._baseAddress}/audio/streamingcapabilities.cgi`;
        const formData = { apiVersion: '1.0', method: 'list' };

        try {
            const res = await this.client.fetchPostJson(proxy, url, formData);

            const encoders = JSON.parse(res).data.encoders;
            const data = encoders.aac ?? encoders.AAC ?? []; // available firmware 7.*>
            return data.map((item: { sample_rate: number; bit_rates: number[] }) => {
                return {
                    sampleRate: item.sample_rate,
                    bitRates: item.bit_rates,
                };
            });
        } catch (err) {
            this.logger.addExceptionError(err);
            return [];
        }
    }

    async listPTZ(camera: number, proxy: TProxyParam = null): Promise<TCameraPTZItem[]> {
        const url = `${this._baseAddress}/com/ptz.cgi`;
        try {
            const response = await this.client.fetchPostUrlEncoded(proxy, url, {
                camera,
                query: 'presetposcamdata',
                format: 'json',
            });

            return parseCameraPTZfromReq(response)[camera] ?? [];
        } catch (err) {
            this.logger.addExceptionError(err);
            return [];
        }
    }

    async listPTZVideoSourceOverview(proxy: TProxyParam = null): Promise<TPtzOverview> {
        const url = `${this._baseAddress}/com/ptz.cgi`;
        try {
            const response = await this.client.fetchPostUrlEncoded(proxy, url, {
                query: 'presetposall',
                format: 'json',
            });

            // presetposall is not returning the data => ignore them
            const data = parseCameraPTZfromReq(response);

            const res: TPtzOverview = {};
            Object.keys(data).forEach((camera) => {
                res[Number(camera) - 1] = data[Number(camera)].map(({ data, ...d }) => d);
            });
            return res;
        } catch (err) {
            this.logger.addExceptionError(err);
            return [];
        }
    }

    async gotoPTZ(camera: number, ptzId: number, proxy: TProxyParam = null) {
        const url = `${this._baseAddress}/com/ptz.cgi`;
        try {
            await this.client.fetchPostUrlEncoded(proxy, url, {
                gotoserverpresetno: ptzId,
                camera,
            });
        } catch (err) {
            this.logger.addExceptionError(err);
        }
    }

    async getPTZPosition(camera: number, proxy: TProxyParam = null): Promise<TCameraPTZItemData> {
        const url = `${this._baseAddress}/com/ptz.cgi`;
        try {
            const res = await this.client.fetchPostUrlEncoded(proxy, url, {
                query: 'position',
                camera,
            });
            const data = this.parseGetParametrs(res);

            return {
                pan: Number(data.pan),
                tilt: Number(data.tilt),
                zoom: Number(data.zoom),
            };
        } catch (err) {
            this.logger.addExceptionError(err);
        }

        return {
            pan: 0,
            tilt: 0,
            zoom: 0,
        };
    }

    async checkSDCard(proxy: TProxyParam = null): Promise<TSDCardInfo> {
        const url = `${this._baseAddress}/disks/list.cgi`;
        const res: string = await this.client.fetchPostUrlEncoded(proxy, url, {
            diskid: 'SD_DISK',
        });

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true,
        });
        const data = parser.parse(res).root.disks.disk;

        return {
            available: data.status === 'OK',
            totalSize: Number(data.totalsize),
            freeSize: Number(data.freesize),
        };
    }

    async downloadCameraReport(proxy: TProxyParam = null): Promise<File> {
        const url = `${this._baseAddress}/serverreport.cgi`;
        const report = await this.client.fetchGet(proxy, url, { mode: 'text' });

        return new File([report], 'server_report.txt', { type: 'text/plain' });
    }

    async getMaxFps(source: number, proxy: TProxyParam = null) {
        const url = `${this._baseAddress}/capturemode.cgi`;

        const res = await this.client.fetchPostJson(proxy, url, { apiVersion: '1.0', method: 'getCaptureModes' });
        const response = JSON.parse(res);

        const channels = response.data;
        if (channels === undefined) {
            throw new Error(`Malformed reply from camera`);
        }
        const channel = channels.find((x: any) => x.channel === source);

        if (channel === undefined) {
            throw new Error(`Video channel '${source}' not found`);
        }

        const captureModes = channel.captureMode;
        const captureMode = captureModes.find((x: any) => x.enabled === true);
        if (captureMode === undefined) {
            throw new Error(`No enabled capture mode found.`);
        }

        const maxFps = parseInt(captureMode.maxFPS, 10);
        if (isNaN(maxFps)) {
            throw new Error(`Max fps not specified for given capture mode.`);
        }

        return maxFps;
    }

    async getTimezone() {
        const url = `${this._baseAddress}/time.cgi`;
        const res = await this.client.fetchPostJson(null, url, { apiVersion: '1.0', method: 'getDateTimeInfo' });
        return JSON.parse(res)?.timeZone ?? 'Europe/Prague';
    }

    async getHeaders(): Promise<Record<string, string>> {
        try {
            const url = `${this._baseAddress}/customhttpheader.cgi`;
            const res = await this.client.fetchPostJson(null, url, { apiVersion: '1.0', method: 'list' });
            return JSON.parse(res).data ?? {};
        } catch (e) {
            // not all of the cameras supports this call
            return {};
        }
    }

    async setHeaders(headers: Record<string, string>) {
        try {
            const url = `${this._baseAddress}/customhttpheader.cgi`;
            await this.client.fetchPostJson(null, url, { apiVersion: '1.0', method: 'set', params: headers });
        } catch (e) {
            this.logger.addExceptionWarn(e, `Headers ${JSON.stringify(headers)} were not setted`);
        }
    }

    //* ************************************************************************************************************
    //* ******************   Private help functions
    //* ************************************************************************************************************

    private parseGetParametrs(response: string) {
        const params: Record<string, string> = {};
        const lines = response.split(/[\r\n]/);

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].substring(0, 7) === '# Error') {
                continue;
            }
            if (lines[i].length) {
                const p = lines[i].split(/=(.+)/);
                if (p.length >= 2) {
                    const paramName = p[0].replace('root.', '');
                    params[paramName] = String(p[1]);
                } else if (p[0].substring(0, 7) !== '# Error') {
                    params[p[0].slice(0, -1)] = '';
                }
            }
        }
        return params;
    }

    private checkResultForError(msg: string, method: string, additionalInfo: string): boolean {
        if (msg.substring(0, 7) === '# Error') {
            this.writeErrorMsg(`${method} => ${additionalInfo} => ${msg}`);
            return false;
        }
        try {
            const data = JSON.parse(msg);
            if (data.status !== 200) {
                this.writeErrorMsg(`${method} => ${additionalInfo} => ${msg}`);
                return false;
            }
        } catch {
            // its ok
        }
        return true;
    }

    private writeErrorMsg(msg: string) {
        this.logger.addExceptionError(`Error in VapixAgent.${msg}`);
    }
}
