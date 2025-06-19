import * as prettifyXml from 'prettify-xml';
import { parseStringPromise } from 'xml2js';
import { WritableStream } from 'node:stream/web';

import { IClient, isClient, isNullish, responseStringify } from './internal/common';
import { DefaultAgent } from './DefaultAgent';

import {
    CameraVapixOptions,
    TApplicationList,
    TApplication,
    TGuardTour,
    TAudioSampleRates,
    TSDCardInfo,
    TPtzOverview,
    TCameraPTZItem,
    TCameraPTZItemData,
    TAudioDevice,
    TAudioDeviceFromRequest,
} from './types/CameraVapix';
import {
    ApplicationAPIError,
    FetchDeviceInfoError,
    MaxFPSError,
    NoDeviceInfoError,
    SDCardActionError,
    SDCardJobError,
} from './errors/errors';

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
        const res = await this.vapixGet('/axis-cgi/jpg/image.cgi', { resolution, compression, camera });
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

    async performAutofocus(): Promise<void> {
        try {
            const data = JSON.stringify({
                apiVersion: '1',
                method: 'performAutofocus',
                params: {
                    optics: [
                        {
                            opticsId: '0',
                        },
                    ],
                },
            });

            await this.vapixPost('/axis-cgi/opticscontrol.cgi', data);
        } catch (err) {
            // lets try the old api
            const data = JSON.stringify({
                autofocus: 'perform',
                source: '1',
            });

            await this.vapixPost('/axis-cgi/opticssetup.cgi', data);
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

    async mountSdCard() {
        return this._doSDCardMountAction('MOUNT');
    }

    async unmountSDCard() {
        return this._doSDCardMountAction('UNMOUNT');
    }

    private async _doSDCardMountAction(action: 'MOUNT' | 'UNMOUNT') {
        const res = await this.vapixGet('/axis-cgi/disks/mount.cgi', {
            action: action,
            diskid: 'SD_DISK',
        });

        const result = await parseStringPromise(await res.text(), {
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false,
        });

        const job = result.root.job;

        if (job.result !== 'OK') {
            throw new SDCardActionError(action, await responseStringify(res));
        }

        return Number(job.jobid);
    }

    // This is supposed to be called in interval in client code until progress is 100
    async fetchSDCardJobProgress(jobId: number) {
        const res = await this.vapixGet('/disks/job.cgi', {
            jobid: String(jobId),
            diskid: 'SD_DISK',
        });

        const result = await parseStringPromise(await res.text(), {
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false,
        });

        const job = result.root.job;

        if (job.result !== 'OK') {
            throw new SDCardJobError();
        }

        return Number(job.progress);
    }

    async downloadCameraReport(): Promise<Response> {
        const res = await this.vapixGet('/axis-cgi/serverreport.cgi', { mode: 'text' });

        if (res.ok) {
            return res;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getSystemLog(): Promise<Response> {
        const res = await this.vapixGet('/axis-cgi/admin/systemlog.cgi');

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

        const response = (await res.json()) as Partial<TCaptureModeResponse>;

        const channels = response.data;
        if (channels === undefined) {
            throw new MaxFPSError('MALFORMED_REPLY');
        }
        const channelData = channels.find((x) => x.channel === channel);

        if (channelData === undefined) {
            throw new MaxFPSError('CHANNEL_NOT_FOUND');
        }

        const captureModes = channelData.captureMode;
        const captureMode = captureModes.find((x) => x.enabled === true);
        if (captureMode === undefined) {
            throw new MaxFPSError('CAPTURE_MODE_NOT_FOUND');
        }

        const maxFps = parseInt(captureMode.maxFPS, 10);
        if (isNaN(maxFps)) {
            throw new MaxFPSError('FPS_NOT_SPECIFIED');
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

    async getDateTimeInfo(): Promise<
        Partial<{
            dateTime: string;
            dstEnabled: boolean;
            localDateTime: string;
            posixTimeZone: string;
            timeZone: string;
        }>
    > {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'getDateTimeInfo' });
        const res = await this.vapixPost('/axis-cgi/time.cgi', data);

        if (res.ok) {
            return ((await res.json()) as any)?.data;
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async getDevicesSettings(): Promise<TAudioDevice[]> {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'getDevicesSettings' });
        const res = await this.vapixPost('/axis-cgi/audiodevicecontrol.cgi', data);

        if (res.ok) {
            const result: TAudioDeviceFromRequest[] = ((await res.json()) as any).devices ?? [];

            return result.map((device: TAudioDeviceFromRequest) => ({
                ...device,
                inputs: (device.inputs || []).sort((a, b) => a.id.localeCompare(b.id)),
                outputs: (device.outputs || []).sort((a, b) => a.id.localeCompare(b.id)),
            }));
        } else {
            throw new Error(await responseStringify(res));
        }
    }

    async fetchRemoteDeviceInfo<T>(payload: T) {
        let res: Response;
        try {
            const data = JSON.stringify(payload);
            res = await this.vapixPost('/axis-cgi/basicdeviceinfo.cgi', data);
        } catch (err) {
            throw new FetchDeviceInfoError(err);
        }

        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const result = await parseStringPromise(await res.text(), {
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false,
        });

        if (isNullish(result.body.data)) {
            throw new NoDeviceInfoError();
        }

        return result.data;
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
        } catch (err) {
            return {};
        }
    }

    async setHeaders(headers: Record<string, string>): Promise<Response> {
        const data = JSON.stringify({ apiVersion: '1.0', method: 'set', params: headers });
        return this.vapixPost('/axis-cgi/customhttpheader.cgi', data);
    }

    private parseParameters(response: string): Record<string, string> {
        const params: Record<string, string> = {};
        const lines = response.split(/[\r\n]/);

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length === 0 || lines[i].substring(0, 7) === '# Error') {
                continue;
            }

            const delimiterPos = lines[i].indexOf('=');
            if (delimiterPos !== -1) {
                const paramName = lines[i].substring(0, delimiterPos);
                const paramValue = lines[i].substring(delimiterPos + 1);
                params[paramName] = paramValue;
            }
        }
        return params;
    }

    //  -------------------------------
    //            param.cgi
    //  -------------------------------

    async getParameterGroup(groupNames: string) {
        const response = await this.vapixGet('/axis-cgi/param.cgi', { action: 'list', group: groupNames });
        return this.parseParameters(await response.text());
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

    setGuardTourEnabled(guardTourID: string, enable: boolean) {
        const options: Record<string, string> = {};
        options[guardTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(options);
    }

    //  -------------------------------
    //             ptz.cgi
    //  -------------------------------

    private parsePtz(parsed: string[]): TCameraPTZItem[] {
        const res: TCameraPTZItem[] = [];
        parsed.forEach((value: string) => {
            const delimiterPos = value.indexOf('=');
            if (delimiterPos === -1) {
                return;
            }
            if (!value.startsWith('presetposno')) {
                return;
            }

            const id = Number(value.substring(11, delimiterPos));
            if (Number.isNaN(id)) {
                return;
            }

            const data = value.substring(delimiterPos + 1).split(':');
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
    private parseCameraPtzResponse(response: string) {
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
            await this.vapixGet('/axis-cgi/com/ptz.cgi', { query: 'presetposcam', camera: channel.toString() })
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
            const response = await this.vapixGet('/axis-cgi/com/ptz.cgi', {
                query: 'presetposall',
                format: 'json',
            });

            const data = this.parseCameraPtzResponse(await response.text());

            const res: TPtzOverview = {};
            Object.keys(data).forEach((camera) => {
                res[Number(camera) - 1] = data[Number(camera)].map(({ data: itemData, ...d }) => d);
            });
            return res;
        } catch (err) {
            return [];
        }
    }

    goToPreset(channel: number, presetName: string) {
        return this.vapixGet('/axis-cgi/com/ptz.cgi', { camera: channel.toString(), gotoserverpresetname: presetName });
    }

    async getPtzPosition(camera: number): Promise<TCameraPTZItemData> {
        try {
            const res = await this.vapixGet('/axis-cgi/com/ptz.cgi', {
                query: 'position',
                camera: camera.toString(),
            });

            const params = this.parseParameters(await res.text());

            return {
                pan: Number(params.pan),
                tilt: Number(params.tilt),
                zoom: Number(params.zoom),
            };
        } catch (err) {
            return { pan: 0, tilt: 0, zoom: 0 };
        }
    }

    //  -------------------------------
    //            port.cgi
    //  -------------------------------

    async getInputState(port: number) {
        const response = await (await this.vapixGet('/axis-cgi/io/port.cgi', { checkactive: port.toString() })).text();
        return response.split('=')[1].indexOf('active') === 0;
    }

    async setOutputState(port: number, active: boolean) {
        return this.vapixGet('/axis-cgi/io/port.cgi', { action: active ? `${port}:/` : `${port}:\\` });
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

        if (res.ok && text === 'ok') {
            return;
        } else if (text.startsWith('error:') && text.substring(7) === '6') {
            return;
        } else {
            throw new ApplicationAPIError('START', await responseStringify(res));
        }
    }

    async restartApplication(applicationID: string) {
        const res = await this.vapixGet('/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'restart',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (res.ok && text === 'ok') {
            return;
        } else {
            throw new ApplicationAPIError('RESTART', await responseStringify(res));
        }
    }

    async stopApplication(applicationID: string) {
        const res = await this.vapixGet('/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'stop',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (res.ok && text === 'ok') {
            return;
        } else if (text.startsWith('error:') && text.substring(7) === '6') {
            return;
        } else {
            throw new ApplicationAPIError('STOP', await responseStringify(res));
        }
    }
}
