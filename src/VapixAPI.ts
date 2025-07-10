import * as prettifyXml from 'prettify-xml';
import { parseStringPromise } from 'xml2js';

import { IClient, isNullish, responseStringify, TParameters } from './internal/common';

import {
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
    sdCardWatchedStatuses,
    APP_IDS,
    maxFpsResponseSchema,
    dateTimeinfoSchema,
    audioDeviceRequestSchema,
    audioSampleRatesResponseSchema,
} from './types/VapixAPI';
import {
    ApplicationAPIError,
    MaxFPSError,
    NoDeviceInfoError,
    SDCardActionError,
    SDCardJobError,
} from './errors/errors';
import { ProxyClient } from './internal/ProxyClient';
import { TCameraImageConfig, TProxyParam } from './types/common';
import { arrayToUrl, paramToUrl } from './internal/utils';
import { z } from 'zod';

export class VapixAPI<Client extends IClient = IClient> {
    client: ProxyClient<Client>;

    constructor(client: Client, getProxyUrl: () => string) {
        this.client = new ProxyClient(client, getProxyUrl);
    }

    /**
     * url encoded post request
     * there is a problem on some routers with the url size limit
     */
    async getUrlEncoded(
        proxy: TProxyParam,
        path: string,
        parameters?: TParameters,
        headers: Record<string, string> = {}
    ) {
        const data = paramToUrl(parameters);
        const head = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' };
        const res = await this.client.post(proxy, path, data, {}, head);
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return res;
    }

    /**
     * sends data as JSON
     */
    async postJson(
        proxy: TProxyParam,
        path: string,
        jsonData: Record<string, any>,
        headers: Record<string, string> = {}
    ) {
        const data = JSON.stringify(jsonData);
        const head = { ...headers, 'Content-Type': 'application/json' };
        const res = await this.client.post(proxy, path, data, {}, head);
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return res;
    }

    async getCameraImage(params: TCameraImageConfig, proxy: TProxyParam = null) {
        return await this.client.get(proxy, '/axis-cgi/jpg/image.cgi', params);
    }

    async getEventDeclarations(proxy: TProxyParam = null): Promise<string> {
        const data =
            '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
            '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
            '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
            '</s:Body>' +
            '</s:Envelope>';
        const res = await this.client.post(proxy, '/vapix/services', data, { 'Content-Type': 'application/soap+xml' });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        const declarations = await res.text();
        return prettifyXml(declarations);
    }

    async getSupportedAudioSampleRate(proxy: TProxyParam = null): Promise<TAudioSampleRates[]> {
        const url = '/axis-cgi/audio/streamingcapabilities.cgi';
        const formData = { apiVersion: '1.0', method: 'list' };
        const res = await this.postJson(proxy, url, formData);

        const encoders = audioSampleRatesResponseSchema.parse(await res.json()).data.encoders;
        const data = encoders.aac ?? encoders.AAC ?? [];
        return data.map((item: { sample_rate: number; bit_rates: number[] }) => {
            return {
                sampleRate: item.sample_rate,
                bitRates: item.bit_rates,
            };
        });
    }

    async performAutofocus(proxy: TProxyParam = null) {
        try {
            const data = {
                apiVersion: '1',
                method: 'performAutofocus',
                params: {
                    optics: [
                        {
                            opticsId: '0',
                        },
                    ],
                },
            };

            await this.postJson(proxy, '/axis-cgi/opticscontrol.cgi', data);
        } catch (err) {
            // lets try the old api
            await this.postJson(proxy, '/axis-cgi/opticssetup.cgi', {
                autofocus: 'perform',
                source: '1',
            });
        }
    }

    async checkSDCard(proxy: TProxyParam = null): Promise<TSDCardInfo> {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/disks/list.cgi', {
            diskid: 'SD_DISK',
        });
        const result = await parseStringPromise(await res.text(), {
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false,
        });

        const data = result.root.disks.disk;

        return {
            totalSize: parseInt(data.totalsize),
            freeSize: parseInt(data.freesize),
            status: sdCardWatchedStatuses.includes(data.status) ? data.status : 'disconnected',
        };
    }

    mountSDCard(proxy: TProxyParam = null) {
        return this._doSDCardMountAction('MOUNT', proxy);
    }

    unmountSDCard(proxy: TProxyParam = null) {
        return this._doSDCardMountAction('UNMOUNT', proxy);
    }

    private async _doSDCardMountAction(action: 'MOUNT' | 'UNMOUNT', proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/disks/mount.cgi', {
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
    async fetchSDCardJobProgress(jobId: number, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/disks/job.cgi', {
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

    downloadCameraReport(proxy: TProxyParam = null) {
        return this.getUrlEncoded(proxy, '/axis-cgi/serverreport.cgi', { mode: 'text' });
    }

    getSystemLog(proxy: TProxyParam = null) {
        return this.getUrlEncoded(proxy, '/axis-cgi/admin/systemlog.cgi');
    }

    async getMaxFps(channel: number, proxy: TProxyParam = null) {
        const data = { apiVersion: '1.0', method: 'getCaptureModes' };
        const res = await this.postJson(proxy, '/axis-cgi/capturemode.cgi', data);
        const response = maxFpsResponseSchema.parse(await res.json());

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

        if (isNullish(captureMode.maxFPS)) {
            throw new MaxFPSError('FPS_NOT_SPECIFIED');
        }

        return captureMode.maxFPS;
    }

    async getTimezone(proxy: TProxyParam = null): Promise<string> {
        const data = { apiVersion: '1.0', method: 'getDateTimeInfo' };
        const res = await this.postJson(proxy, '/axis-cgi/time.cgi', data);
        return ((await res.json()) as any)?.timeZone ?? 'Europe/Prague';
    }

    async getDateTimeInfo(proxy: TProxyParam = null) {
        const data = { apiVersion: '1.0', method: 'getDateTimeInfo' };
        const res = await this.postJson(proxy, '/axis-cgi/time.cgi', data);
        return dateTimeinfoSchema.parse(await res.json());
    }

    async getDevicesSettings(proxy: TProxyParam = null): Promise<TAudioDevice[]> {
        const data = { apiVersion: '1.0', method: 'getDevicesSettings' };
        const res = await this.postJson(proxy, '/axis-cgi/audiodevicecontrol.cgi', data);

        const result = audioDeviceRequestSchema.parse(await res.json());

        return result.devices.map((device: TAudioDeviceFromRequest) => ({
            ...device,
            inputs: (device.inputs || []).sort((a, b) => a.id.localeCompare(b.id)),
            outputs: (device.outputs || []).sort((a, b) => a.id.localeCompare(b.id)),
        }));
    }

    async fetchRemoteDeviceInfo<T extends Record<string, any>>(payload: T, proxy: TProxyParam = null) {
        const res = await this.postJson(proxy, '/axis-cgi/basicdeviceinfo.cgi', payload);

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

    async getHeaders(proxy: TProxyParam = null) {
        const data = { apiVersion: '1.0', method: 'list' };
        const res = await this.postJson(proxy, '/axis-cgi/customhttpheader.cgi', data);

        return z.object({ data: z.record(z.string()) }).parse(await res.json()).data;
    }

    async setHeaders(headers: Record<string, string>, proxy: TProxyParam = null) {
        const data = { apiVersion: '1.0', method: 'set', params: headers };
        return this.postJson(proxy, '/axis-cgi/customhttpheader.cgi', data);
    }

    //  -------------------------------
    //            param.cgi
    //  -------------------------------

    async getParameter(paramNames: string | string[], proxy: TProxyParam = null) {
        const response = await this.getUrlEncoded(proxy, '/axis-cgi/param.cgi', {
            action: 'list',
            group: arrayToUrl(paramNames),
        });
        return parseParameters(await response.text());
    }

    async setParameter(params: Record<string, string | number | boolean>, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/param.cgi', {
            ...params,
            action: 'update',
        });
        const responseText = await res.text();
        if (responseText.startsWith('# Error')) {
            throw new Error(responseText);
        }
        return true;
    }

    async getGuardTourList(proxy: TProxyParam = null) {
        const gTourList = new Array<TGuardTour>();
        const response = await this.getParameter('GuardTour', proxy);
        for (let i = 0; i < 20; i++) {
            const gTourBaseName = 'root.GuardTour.G' + i;
            if (gTourBaseName + '.CamNbr' in response) {
                const gTour: TGuardTour = {
                    id: gTourBaseName,
                    camNbr: response[gTourBaseName + '.CamNbr'],
                    name: response[gTourBaseName + '.Name'] ?? 'Guard Tour ' + (i + 1),
                    randomEnabled: response[gTourBaseName + '.RandomEnabled'],
                    running: response[gTourBaseName + '.Running'] ?? 'no',
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

    setGuardTourEnabled(guardTourID: string, enable: boolean, proxy: TProxyParam = null) {
        const options: Record<string, string> = {};
        options[guardTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(options, proxy);
    }

    //  -------------------------------
    //             ptz.cgi
    //  -------------------------------

    async getPTZPresetList(channel: number, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/com/ptz.cgi', {
            query: 'presetposcam',
            camera: channel.toString(),
        });
        const text = await res.text();
        const lines = text.split(/[\r\n]/);
        const positions: string[] = [];
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

    async listPTZ(camera: number, proxy: TProxyParam = null): Promise<TCameraPTZItem[]> {
        const url = `/axis-cgi/com/ptz.cgi`;
        const response = await this.getUrlEncoded(proxy, url, {
            camera,
            query: 'presetposcamdata',
            format: 'json',
        });

        return parseCameraPtzResponse(await response.text())[camera] ?? [];
    }

    async listPtzVideoSourceOverview(proxy: TProxyParam = null): Promise<TPtzOverview> {
        const response = await this.getUrlEncoded(proxy, '/axis-cgi/com/ptz.cgi', {
            query: 'presetposall',
            format: 'json',
        });

        const data = parseCameraPtzResponse(await response.text());

        const res: TPtzOverview = {};
        Object.keys(data)
            .map(Number)
            .forEach((camera) => {
                if (data[camera] !== undefined) {
                    // convert source (sometimes called camera) to viewNumber
                    res[camera - 1] = data[camera]?.map(({ data: itemData, ...d }) => d);
                }
            });
        return res;
    }

    goToPreset(channel: number, presetName: string, proxy: TProxyParam = null) {
        return this.getUrlEncoded(proxy, '/axis-cgi/com/ptz.cgi', {
            camera: channel.toString(),
            gotoserverpresetname: presetName,
        });
    }

    async getPtzPosition(camera: number, proxy: TProxyParam = null): Promise<TCameraPTZItemData> {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/com/ptz.cgi', {
            query: 'position',
            camera: camera.toString(),
        });

        const params = parseParameters(await res.text());

        return {
            pan: Number(params.pan),
            tilt: Number(params.tilt),
            zoom: Number(params.zoom),
        };
    }

    //  -------------------------------
    //            port.cgi
    //  -------------------------------

    async getInputState(port: number, proxy: TProxyParam = null) {
        const response = await (
            await this.getUrlEncoded(proxy, '/axis-cgi/io/port.cgi', { checkactive: port.toString() })
        ).text();
        return response.split('=')[1]?.indexOf('active') === 0;
    }

    async setOutputState(port: number, active: boolean, proxy: TProxyParam = null) {
        return this.getUrlEncoded(proxy, '/axis-cgi/io/port.cgi', { action: active ? `${port}:/` : `${port}:\\` });
    }

    //  -------------------------------
    //          application API
    //  -------------------------------

    async getApplicationList(proxy: TProxyParam = null): Promise<TApplication[]> {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/applications/list.cgi');
        const xml = await res.text();
        const result = (await parseStringPromise(xml)) as TApplicationList;

        const apps = [];
        for (const app of result.reply.application) {
            apps.push({
                ...app.$,
                appId: APP_IDS.find((id) => id.toLowerCase() === app.$.Name.toLowerCase()) ?? null,
            });
        }
        return apps;
    }

    async startApplication(applicationID: string, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'start',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('START', await responseStringify(res));
        }
    }

    async restartApplication(applicationID: string, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'restart',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok') {
            throw new ApplicationAPIError('RESTART', await responseStringify(res));
        }
    }

    async stopApplication(applicationID: string, proxy: TProxyParam = null) {
        const res = await this.getUrlEncoded(proxy, '/axis-cgi/applications/control.cgi', {
            package: applicationID.toLowerCase(),
            action: 'stop',
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('STOP', await responseStringify(res));
        }
    }

    async installApplication(data: Blob, fileName: string) {
        const formData = new FormData();
        formData.append('packfil', data, fileName);

        const res = await this.client.post(
            null,
            '/axis-cgi/applications/upload.cgi',
            formData,
            {},
            {
                contentType: 'application/octet-stream',
            }
        );
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const text = await res.text();
        if (text.length > 5) {
            throw new Error('installing error: ' + text);
        }
    }
}

const parseParameters = (response: string) => {
    const params: Record<string, string> = {};
    const lines = response.split(/[\r\n]/);

    for (const line of lines) {
        if (line.length === 0 || line.substring(0, 7) === '# Error') {
            continue;
        }

        const delimiterPos = line.indexOf('=');
        if (delimiterPos !== -1) {
            const paramName = line.substring(0, delimiterPos);
            const paramValue = line.substring(delimiterPos + 1);
            params[paramName] = paramValue;
        }
    }
    return params;
};

const parseCameraPtzResponse = (response: string) => {
    const json = JSON.parse(response);
    const parsed: Record<number, TCameraPTZItem[]> = {};

    Object.keys(json).forEach((key) => {
        if (!key.startsWith('Camera ')) {
            return;
        }

        const camera = Number(key.replace('Camera ', ''));
        if (json[key].presets !== undefined) {
            parsed[camera] = parsePtz(json[key].presets);
        }
    });

    return parsed;
};

const parsePtz = (parsed: string[]): TCameraPTZItem[] => {
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
            name: data[0] ?? 'Preset ' + id,
            data: {
                pan: getValue('pan'),
                tilt: getValue('tilt'),
                zoom: getValue('zoom'),
            },
        });
    });
    return res;
};
