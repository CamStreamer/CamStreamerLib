import * as prettifyXml from 'prettify-xml';
import { parseStringPromise } from 'xml2js';
import { WritableStream } from 'node:stream/web';

import { HttpOptions, IClient, isClient, responseStringify } from './internal/common';
import { DefaultAgent } from './DefaultAgent';

export type CameraVapixOptions = HttpOptions;

export type TApplicationList = {
    reply: {
        $: { result: string };
        application: {
            $: TApplication;
        }[];
    };
};

export type TApplication = {
    Name: string;
    NiceName: string;
    Vendor: string;
    Version: string;
    ApplicationID?: string;
    License: string;
    Status: string;
    ConfigurationPage?: string;
    VendorHomePage?: string;
    LicenseName?: string;
};

export type TGuardTour = {
    id: string;
    camNbr: unknown;
    name: string;
    randomEnabled: unknown;
    running: string;
    timeBetweenSequences: unknown;
    tour: {
        moveSpeed: unknown;
        position: unknown;
        presetNbr: unknown;
        waitTime: unknown;
        waitTimeViewType: unknown;
    }[];
};

export type TAudioSampleRates = {
    sampleRate: number;
    bitRates: number[];
};

export type TSDCardInfo = {
    available: boolean;
    totalSize: number;
    freeSize: number;
};

export type TPtzOverview = Record<number, { id: number; name: string }[]>;
export type TCameraPTZItem = {
    name: string;
    id: number;
    data: TCameraPTZItemData;
};
export type TCameraPTZItemData = {
    pan?: number;
    tilt?: number;
    zoom?: number;
};

export class CameraVapix {
    private client: IClient;

    constructor(options: CameraVapixOptions | IClient = {}) {
        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    vapixGet(path: string, parameters?: Record<string, string>) {
        return this.client.get(path, parameters);
    }

    vapixPost(path: string, data: string | Buffer | FormData, contentType?: string) {
        let headers = {};
        if (contentType !== undefined) {
            headers = { 'Content-Type': contentType };
        }
        return this.client.post(path, data, {}, headers);
    }

    async getCameraImage(camera: string, compression: string, resolution: string, outputStream: WritableStream) {
        const path = `/axis-cgi/jpg/image.cgi?resolution=${resolution}&compression=${compression}&camera=${camera}`;
        const res = await this.vapixGet(path);
        if (res.body) {
            void res.body.pipeTo(outputStream);
        }
        return outputStream;
    }

    async getEventDeclarations() {
        const data =
            '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
            '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
            '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
            '</s:Body>' +
            '</s:Envelope>';
        const declarations = await (await this.vapixPost('/vapix/services', data, 'application/soap+xml')).text();
        return prettifyXml(declarations) as string;
    }

    async getSupportedAudioSampleRate(): Promise<TAudioSampleRates[]> {
        const url = '/axis-cgi/audio/streamingcapabilities.cgi';
        const formData = { apiVersion: '1.0', method: 'list' };
        const res = await this.vapixPost(url, JSON.stringify(formData));

        try {
            const encoders = ((await res.json()) as any).data.encoders;
            const data = encoders.aac ?? encoders.AAC ?? [];
            return data.map((item: { sample_rate: number; bit_rates: number[] }) => {
                return {
                    sampleRate: item.sample_rate,
                    bitRates: item.bit_rates,
                };
            });
        } catch (err) {
            return [];
        }
    }

    async checkSdCard(): Promise<TSDCardInfo> {
        const res = await this.vapixGet('/axis-cgi/disks/list.cgi', {
            diskid: 'SD_DISK',
        });
        const result = await parseStringPromise(await res.text(), {
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false,
        });

        const data = result.root.disks.disk;

        return {
            available: data.status === 'OK',
            totalSize: parseInt(data.totalsize),
            freeSize: parseInt(data.freesize),
        };
    }

    async downloadCameraReport(): Promise<Response> {
        const res = await this.vapixGet('/axis-cgi/serverreport.cgi', { mode: 'text' });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getMaxFps(channel: number): Promise<number> {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'getCaptureModes' });

        type TCaptureModeResponse = {
            data: {
                channel: number;
                captureMode: {
                    enabled: boolean;
                    maxFPS: string;
                }[];
            }[];
        };
        const res = await this.vapixPost('/axis-cgi/capturemode.cgi', data);

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const response = (await res.json()) as TCaptureModeResponse;

        const channels = response.data;
        if (channels === undefined) {
            throw new Error(`Malformed reply from camera`);
        }
        const channelData = channels.find((x) => x.channel === channel);

        if (channelData === undefined) {
            throw new Error(`Video channel '${channel}' not found`);
        }

        const captureModes = channelData.captureMode;
        const captureMode = captureModes.find((x) => x.enabled === true);
        if (captureMode === undefined) {
            throw new Error(`No enabled capture mode found.`);
        }

        const maxFps = parseInt(captureMode.maxFPS, 10);
        if (isNaN(maxFps)) {
            throw new Error(`Max fps not specified for given capture mode.`);
        }

        return maxFps;
    }

    async getTimezone(): Promise<string> {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'getDateTimeInfo' });
        const res = await this.vapixPost('/axis-cgi/time.cgi', data);

        if (res.ok) {
            return ((await res.json()) as any)?.timeZone ?? 'Europe/Prague';
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getHeaders(): Promise<Record<string, string>> {
        try {
            const data = JSON.stringify({ apiVersion: '1.0', method: 'list' });
            const res = await this.vapixPost('/axis-cgi/customhttpheader.cgi', data);

            if (res.ok) {
                return ((await res.json()) as any).data ?? {};
            } else {
                return {};
            }
        } catch (e) {
            return {};
        }
    }

    async setHeaders(headers: Record<string, string>): Promise<Response> {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'set', params: headers });
        return this.vapixPost('/axis-cgi/customhttpheader.cgi', data);
    }

    private parseGetParametrs(response: string): Record<string, string> {
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

    //  -------------------------------
    //            param.cgi
    //  -------------------------------

    async getParameterGroup(groupNames: string) {
        const response = await (
            await this.vapixGet(`/axis-cgi/param.cgi?action=list&group=${encodeURIComponent(groupNames)}`)
        ).text();
        const params: Record<string, string> = {};
        const lines = response.split(/[\r\n]/);
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length) {
                const p = lines[i].split('=');
                if (p.length >= 2) {
                    params[p[0]] = p[1];
                }
            }
        }
        return params;
    }

    setParameter(params: Record<string, string>) {
        let postData = 'action=update&';
        for (const key in params) {
            postData += key + '=' + params[key] + '&';
        }
        postData = postData.slice(0, postData.length - 1);
        return this.vapixPost('/axis-cgi/param.cgi', postData);
    }

    async getGuardTourList() {
        const gTourList = new Array<TGuardTour>();
        const response = await this.getParameterGroup('GuardTour');
        for (let i = 0; i < 20; i++) {
            const gTourBaseName = 'root.GuardTour.G' + i;
            if (gTourBaseName + '.CamNbr' in response) {
                const gTour: TGuardTour = {
                    id: gTourBaseName,
                    camNbr: response[gTourBaseName + '.CamNbr'],
                    name: response[gTourBaseName + '.Name'],
                    randomEnabled: response[gTourBaseName + '.RandomEnabled'],
                    running: response[gTourBaseName + '.Running'],
                    timeBetweenSequences: response[gTourBaseName + '.TimeBetweenSequences'],
                    tour: [],
                };
                for (let j = 0; j < 100; j++) {
                    const tourBaseName = 'root.GuardTour.G' + i + '.Tour.T' + j;
                    if (tourBaseName + '.MoveSpeed' in response) {
                        const tour = {
                            moveSpeed: response[tourBaseName + '.MoveSpeed'],
                            position: response[tourBaseName + '.Position'],
                            presetNbr: response[tourBaseName + '.PresetNbr'],
                            waitTime: response[tourBaseName + '.WaitTime'],
                            waitTimeViewType: response[tourBaseName + '.WaitTimeViewType'],
                        };
                        gTour.tour.push(tour);
                    }
                }
                gTourList.push(gTour);
            } else {
                break;
            }
        }
        return gTourList;
    }

    setGuardTourEnabled(gourTourID: string, enable: boolean) {
        const options: Record<string, string> = {};
        options[gourTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(options);
    }

    //  -------------------------------
    //             ptz.cgi
    //  -------------------------------

    private parsePtz(parsed: string[]): TCameraPTZItem[] {
        const res: TCameraPTZItem[] = [];
        parsed.forEach((value: string) => {
            const valueData = value.split('=');
            if (valueData.length < 2) {
                return;
            }
            if (!valueData[0].startsWith('presetposno')) {
                return;
            }

            const id = Number(valueData[0].replace('presetposno', ''));
            if (Number.isNaN(id)) {
                return;
            }

            const data = valueData[1].split(':');

            const getValue = (valueName: string) => {
                for (const d of data) {
                    const p = d.split('=');
                    if (p[0] === valueName) {
                        return Number(p[1]);
                    }
                }
                return 0;
            };

            res.push({
                id,
                name: data[0],
                data: {
                    pan: getValue('pan'),
                    tilt: getValue('tilt'),
                    zoom: getValue('zoom'),
                },
            });
        });
        return res;
    }
    private parseCameraPtzFromReq(response: string) {
        const json = JSON.parse(response);
        const parsed: Record<number, TCameraPTZItem[]> = {};

        Object.keys(json).forEach((key) => {
            if (!key.startsWith('Camera ')) {
                return;
            }

            const camera = Number(key.replace('Camera ', ''));
            if (json[key].presets !== undefined) {
                parsed[camera] = this.parsePtz(json[key].presets);
            }
        });

        return parsed;
    }

    async getPTZPresetList(channel: number) {
        const response = await (
            await this.vapixGet(`/axis-cgi/com/ptz.cgi?query=presetposcam&camera=${encodeURIComponent(channel)}`)
        ).text();
        const positions: string[] = [];
        const lines = response.split(/[\r\n]/);
        for (const line of lines) {
            if (line.indexOf('presetposno') !== -1) {
                const delimiterPos = line.indexOf('=');
                if (delimiterPos !== -1) {
                    const value = line.substring(delimiterPos + 1);
                    positions.push(value);
                }
            }
        }
        return positions;
    }

    async listPtzVideoSourceOverview(): Promise<TPtzOverview> {
        try {
            const response = await this.vapixGet(`/axis-cgi/com/ptz.cgi`, {
                query: 'presetposall',
                format: 'json',
            });

            // presetposall is not returning the data => ignore them
            const data = this.parseCameraPtzFromReq(await response.text());

            const res: TPtzOverview = {};
            Object.keys(data).forEach((camera) => {
                res[Number(camera) - 1] = data[Number(camera)].map(({ data, ...d }) => d);
            });
            return res;
        } catch (err) {
            return [];
        }
    }

    goToPreset(channel: number, presetName: string) {
        return this.vapixPost(
            '/axis-cgi/com/ptz.cgi',
            `camera=${encodeURIComponent(channel)}&gotoserverpresetname=${encodeURIComponent(presetName)}`
        );
    }

    async getPtzPosition(camera: number): Promise<TCameraPTZItemData> {
        try {
            const res = await this.vapixGet(`/axis-cgi/com/ptz.cgi`, {
                query: 'position',
                camera: camera.toString(),
            });
            const data = this.parseGetParametrs(await res.text());

            return {
                pan: Number(data.pan),
                tilt: Number(data.tilt),
                zoom: Number(data.zoom),
            };
        } catch (err) {
            return {
                pan: 0,
                tilt: 0,
                zoom: 0,
            };
        }
    }

    //  -------------------------------
    //            port.cgi
    //  -------------------------------

    async getInputState(port: number) {
        const response = await (
            await this.vapixPost('/axis-cgi/io/port.cgi', `checkactive=${encodeURIComponent(port)}`)
        ).text();
        return response.split('=')[1].indexOf('active') === 0;
    }

    async setOutputState(port: number, active: boolean) {
        return this.vapixPost('/axis-cgi/io/port.cgi', `action=${encodeURIComponent(port)}:${active ? '/' : '\\'}`);
    }

    //  -------------------------------
    //          application API
    //  -------------------------------

    async getApplicationList(): Promise<TApplication[]> {
        const xml = await (await this.vapixGet('/axis-cgi/applications/list.cgi')).text();
        const result = (await parseStringPromise(xml)) as TApplicationList;

        const apps = [];
        for (let i = 0; i < result.reply.application.length; i++) {
            apps.push(result.reply.application[i].$);
        }
        return apps;
    }

    async startApplication(applicationID: string) {
        const res = await this.vapixGet('/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'start',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (res.ok && (await text) === 'ok') {
            return;
        } else if (text.startsWith('error:') && text.substring(7) === '6') {
            return;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async restartApplication(applicationID: string) {
        const res = await this.vapixGet('/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'restart',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (res.ok && (await text) === 'ok') {
            return;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async stopApplication(applicationID: string) {
        const res = await this.vapixGet('/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'stop',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (res.ok && (await text) === 'ok') {
            return;
        } else if (text.startsWith('error:') && text.substring(7) === '6') {
            return;
        } else {
            throw new Error(await responseStringify(res));
        }
    }
}
