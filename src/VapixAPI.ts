import * as prettifyXml from 'prettify-xml';

import { IClient, TParameters, TResponse } from './internal/types';
import { arrayToUrl, isNullish, paramToUrl, responseStringify } from './internal/utils';

import {
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
    applicationSchema,
    timeZoneSchema,
    getPortsResponseSchema,
    TPortSetSchema,
    TPortSequenceStateSchema,
} from './types/VapixAPI';
import {
    ApplicationAPIError,
    MaxFPSError,
    NoDeviceInfoError,
    PtzNotSupportedError,
    SDCardActionError,
    SDCardJobError,
} from './errors/errors';
import { ProxyClient } from './internal/ProxyClient';
import { TCameraImageConfig, THttpRequestOptions, TProxyParams } from './types/common';
import { z } from 'zod';
import { XMLParser } from 'fast-xml-parser';

export class VapixAPI<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(private client: Client) {}

    /**
     * url encoded post request
     * there is a problem on some routers with the url size limit
     */
    async postUrlEncoded(
        path: string,
        parameters?: TParameters,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ) {
        const data = paramToUrl(parameters);
        const head = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' };
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({ path, data, headers: head, timeout: options?.timeout });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return res;
    }

    /**
     * sends data as JSON
     */
    async postJson(
        path: string,
        jsonData: Record<string, any>,
        headers?: Record<string, string>,
        options?: THttpRequestOptions
    ) {
        const data = JSON.stringify(jsonData);
        const head = { ...headers, 'Content-Type': 'application/json' };
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({ path, data, headers: head, timeout: options?.timeout });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        return res;
    }

    async getCameraImage(parameters: TCameraImageConfig, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        return await agent.get({ path: '/axis-cgi/jpg/image.cgi', parameters, timeout: options?.timeout });
    }

    async getEventDeclarations(options?: THttpRequestOptions): Promise<string> {
        const data =
            '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
            '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
            '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
            '</s:Body>' +
            '</s:Envelope>';
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({
            path: '/vapix/services',
            data,
            headers: { 'Content-Type': 'application/soap+xml' },
        });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }
        const declarations = await res.text();
        return prettifyXml(declarations);
    }

    async getSupportedAudioSampleRate(options?: THttpRequestOptions): Promise<TAudioSampleRates[]> {
        const path = '/axis-cgi/audio/streamingcapabilities.cgi';
        const jsonData = { apiVersion: '1.0', method: 'list' };
        const res = await this.postJson(path, jsonData, undefined, options);

        const encoders = audioSampleRatesResponseSchema.parse(await res.json()).data.encoders;
        const data = encoders.aac ?? encoders.AAC ?? [];
        return data.map((item: { sample_rate: number; bit_rates: number[] }) => {
            return {
                sampleRate: item.sample_rate,
                bitRates: item.bit_rates,
            };
        });
    }

    async performAutofocus(options?: THttpRequestOptions) {
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

            await this.postJson('/axis-cgi/opticscontrol.cgi', data, undefined, options);
        } catch (err) {
            // lets try the old api
            await this.postUrlEncoded(
                '/axis-cgi/opticssetup.cgi',
                {
                    autofocus: 'perform',
                    source: '1',
                },
                undefined,
                options
            );
        }
    }

    async checkSDCard(options?: THttpRequestOptions): Promise<TSDCardInfo> {
        const res = await this.postUrlEncoded(
            '/axis-cgi/disks/list.cgi',
            {
                diskid: 'SD_DISK',
            },
            undefined,
            options
        );

        const xmlText = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true,
        });
        const result = parser.parse(xmlText);

        const data = result.root.disks.disk;

        return {
            totalSize: parseInt(data.totalsize),
            freeSize: parseInt(data.freesize),
            status: sdCardWatchedStatuses.includes(data.status) ? data.status : 'disconnected',
        };
    }

    mountSDCard(options?: THttpRequestOptions) {
        return this._doSDCardMountAction('MOUNT', options);
    }

    unmountSDCard(options?: THttpRequestOptions) {
        return this._doSDCardMountAction('UNMOUNT', options);
    }

    private async _doSDCardMountAction(action: 'MOUNT' | 'UNMOUNT', options?: THttpRequestOptions) {
        const res = await this.postUrlEncoded(
            '/axis-cgi/disks/mount.cgi',
            {
                action: action,
                diskid: 'SD_DISK',
            },
            undefined,
            options
        );

        const textXml = await res.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true,
        });
        const result = parser.parse(textXml);

        const job = result.root.job;

        if (job.result !== 'OK') {
            throw new SDCardActionError(action, await responseStringify(res));
        }

        return Number(job.jobid);
    }

    // This is supposed to be called in interval in client code until progress is 100
    async fetchSDCardJobProgress(jobId: number, options?: THttpRequestOptions) {
        const res = await this.postUrlEncoded(
            '/disks/job.cgi',
            {
                jobid: String(jobId),
                diskid: 'SD_DISK',
            },
            undefined,
            options
        );

        const textXml = await res.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true,
        });
        const job = parser.parse(textXml).root.job;

        if (job.result !== 'OK') {
            throw new SDCardJobError();
        }

        return Number(job.progress);
    }

    downloadCameraReport(options?: THttpRequestOptions) {
        return this.postUrlEncoded('/axis-cgi/serverreport.cgi', { mode: 'text' }, undefined, options);
    }

    getSystemLog(options?: THttpRequestOptions) {
        return this.postUrlEncoded('/axis-cgi/admin/systemlog.cgi', undefined, undefined, options);
    }

    async getMaxFps(channel: number, options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'getCaptureModes' };
        const res = await this.postJson('/axis-cgi/capturemode.cgi', data, undefined, options);
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

    async getTimezone(options?: THttpRequestOptions) {
        // try v2 api first
        try {
            const agent = this.getAgent(options?.proxyParams);
            const resV2 = await agent.get({ path: '/config/rest/time/v2/timeZone', timeout: options?.timeout });

            if (!resV2.ok) {
                throw new Error(await responseStringify(resV2));
            }

            const json = await resV2.json();
            const data = timeZoneSchema.parse(json);
            if (data.status === 'error') {
                throw new Error(data.error.message);
            }
            return data.data.activeTimeZone;
        } catch (error) {
            console.warn(
                'Failed to fetch time zone data from time API v2:',
                error instanceof Error ? error.message : JSON.stringify(error)
            );
            console.warn('Falling back to deprecated time API v1');
        }

        // fallback to deprecated api
        const data = await this.getDateTimeInfo(options);
        if (data.data.timeZone === undefined) {
            throw new Error('Time zone not setup on the device');
        }
        return data.data.timeZone;
    }

    async getDateTimeInfo(options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'getDateTimeInfo' };
        const res = await this.postJson('/axis-cgi/time.cgi', data, undefined, options);
        return dateTimeinfoSchema.parse(await res.json());
    }

    async getDevicesSettings(options?: THttpRequestOptions): Promise<TAudioDevice[]> {
        const data = { apiVersion: '1.0', method: 'getDevicesSettings' };
        const res = await this.postJson('/axis-cgi/audiodevicecontrol.cgi', data, undefined, options);
        const result = audioDeviceRequestSchema.parse(await res.json());
        return result.data.devices.map((device: TAudioDeviceFromRequest) => ({
            ...device,
            inputs: (device.inputs || []).sort((a, b) => a.id.localeCompare(b.id)),
            outputs: (device.outputs || []).sort((a, b) => a.id.localeCompare(b.id)),
        }));
    }

    async fetchRemoteDeviceInfo<T extends Record<string, any>>(payload: T, options?: THttpRequestOptions) {
        const res = await this.postJson('/axis-cgi/basicdeviceinfo.cgi', payload, undefined, options);
        const json = await res.json();
        if (isNullish(json.data)) {
            throw new NoDeviceInfoError();
        }
        return json.data;
    }

    async getHeaders(options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'list' };
        const res = await this.postJson('/axis-cgi/customhttpheader.cgi', data, undefined, options);

        return z.object({ data: z.record(z.string()) }).parse(await res.json()).data;
    }

    async setHeaders(headers: Record<string, string>, options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'set', params: headers };
        return this.postJson('/axis-cgi/customhttpheader.cgi', data, undefined, options);
    }

    //  -------------------------------
    //            param.cgi
    //  -------------------------------

    async getParameter(paramNames: string | string[], options?: THttpRequestOptions) {
        const response = await this.postUrlEncoded(
            '/axis-cgi/param.cgi',
            {
                action: 'list',
                group: arrayToUrl(paramNames),
            },
            undefined,
            options
        );
        return VapixAPI.parseParameters(await response.text());
    }

    async setParameter(params: Record<string, string | number | boolean>, options?: THttpRequestOptions) {
        const res = await this.postUrlEncoded(
            '/axis-cgi/param.cgi',
            {
                ...params,
                action: 'update',
            },
            undefined,
            options
        );
        const responseText = await res.text();
        if (responseText.startsWith('# Error')) {
            throw new Error(responseText);
        }
        return true;
    }

    async getGuardTourList(options?: THttpRequestOptions) {
        const gTourList = new Array<TGuardTour>();
        const response = await this.getParameter('GuardTour', options);
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

    setGuardTourEnabled(guardTourID: string, enable: boolean, options?: THttpRequestOptions) {
        const params: Record<string, string> = {};
        params[guardTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(params, options);
    }

    //  -------------------------------
    //             ptz.cgi
    //  -------------------------------

    async getPTZPresetList(channel: number, options?: THttpRequestOptions) {
        const res = await this.postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'presetposcam',
                camera: channel.toString(),
            },
            undefined,
            options
        );
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

    async listPTZ(camera: number, options?: THttpRequestOptions): Promise<TCameraPTZItem[]> {
        const url = `/axis-cgi/com/ptz.cgi`;
        const response = await this.postUrlEncoded(
            url,
            {
                camera,
                query: 'presetposcamdata',
                format: 'json',
            },
            undefined,
            options
        );

        const text = await response.text();
        if (text === '') {
            throw new PtzNotSupportedError();
        }
        return VapixAPI.parseCameraPtzResponse(text)[camera] ?? [];
    }

    async listPtzVideoSourceOverview(options?: THttpRequestOptions): Promise<TPtzOverview> {
        const response = await this.postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'presetposall',
                format: 'json',
            },
            undefined,
            options
        );

        const text = await response.text();
        if (text === '') {
            throw new PtzNotSupportedError();
        }
        const data = VapixAPI.parseCameraPtzResponse(text);

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

    goToPreset(channel: number, presetName: string, options?: THttpRequestOptions) {
        return this.postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                camera: channel.toString(),
                gotoserverpresetname: presetName,
            },
            undefined,
            options
        );
    }

    async getPtzPosition(camera: number, options?: THttpRequestOptions): Promise<TCameraPTZItemData> {
        const res = await this.postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'position',
                camera: camera.toString(),
            },
            undefined,
            options
        );

        const params = VapixAPI.parseParameters(await res.text());

        return {
            pan: Number(params.pan),
            tilt: Number(params.tilt),
            zoom: Number(params.zoom),
        };
    }

    //  -------------------------------
    //        portmanagement.cgi
    //  -------------------------------

    async getPorts(options?: THttpRequestOptions) {
        const res = await this.postJson(
            '/axis-cgi/io/portmanagement.cgi',
            {
                apiVersion: '1.0',
                context: '',
                method: 'getPorts',
            },
            undefined,
            options
        );

        const portResponseParsed = await getPortsResponseSchema.parse(res.json());
        return portResponseParsed.data.items;
    }

    async setPorts(ports: TPortSetSchema[], options?: THttpRequestOptions) {
        await this.postJson(
            '/axis-cgi/io/portmanagement.cgi',
            {
                apiVersion: '1.0',
                context: '',
                method: 'setPorts',
                params: { ports },
            },
            undefined,
            options
        );
    }

    async setPortStateSequence(port: number, sequence: TPortSequenceStateSchema[], options?: THttpRequestOptions) {
        await this.postJson(
            '/axis-cgi/io/portmanagement.cgi',
            {
                apiVersion: '1.0',
                context: '',
                method: 'setStateSequence',
                params: { port, sequence },
            },
            undefined,
            options
        );
    }

    //  -------------------------------
    //          application API
    //  -------------------------------

    async getApplicationList(options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({ path: '/axis-cgi/applications/list.cgi', timeout: options?.timeout });
        const xml = await res.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            allowBooleanAttributes: true,
        });
        const result = parser.parse(xml);

        let apps = result.reply.application ?? [];
        if (!Array.isArray(apps)) {
            apps = [apps];
        }
        return apps.map((app: z.infer<typeof applicationSchema>) => {
            return {
                ...app,
                appId: APP_IDS.find((id) => id.toLowerCase() === app.Name.toLowerCase()) ?? null,
            };
        });
    }

    async startApplication(applicationID: string, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationID.toLowerCase(),
                action: 'start',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('START', await responseStringify(res));
        }
    }

    async restartApplication(applicationID: string, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationID.toLowerCase(),
                action: 'restart',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok') {
            throw new ApplicationAPIError('RESTART', await responseStringify(res));
        }
    }

    async stopApplication(applicationID: string, options?: THttpRequestOptions) {
        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationID.toLowerCase(),
                action: 'stop',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('STOP', await responseStringify(res));
        }
    }

    async installApplication(data: Blob, fileName: string, options?: THttpRequestOptions) {
        const formData = new FormData();
        formData.append('packfil', data, fileName);

        const agent = this.getAgent(options?.proxyParams);
        const res = await agent.post({
            path: '/axis-cgi/applications/upload.cgi',
            data: formData,
            headers: {
                contentType: 'application/octet-stream',
            },
            timeout: options?.timeout ?? 120000,
        });
        if (!res.ok) {
            throw new Error(await responseStringify(res));
        }

        const text = await res.text();
        if (text.length > 5) {
            throw new Error('installing error: ' + text);
        }
    }

    private static parseParameters = (response: string) => {
        const params: Record<string, string> = {};
        const lines = response.split(/[\r\n]/);

        for (const line of lines) {
            if (line.length === 0 || line.substring(0, 7) === '# Error') {
                continue;
            }

            const delimiterPos = line.indexOf('=');
            if (delimiterPos !== -1) {
                const paramName = line.substring(0, delimiterPos).replace('root.', '');
                const paramValue = line.substring(delimiterPos + 1);
                params[paramName] = paramValue;
            }
        }
        return params;
    };

    private static parseCameraPtzResponse = (response: string) => {
        const json = JSON.parse(response);
        const parsed: Record<number, TCameraPTZItem[]> = {};

        Object.keys(json).forEach((key) => {
            if (!key.startsWith('Camera ')) {
                return;
            }

            const camera = Number(key.replace('Camera ', ''));
            if (json[key].presets !== undefined) {
                parsed[camera] = VapixAPI.parsePtz(json[key].presets);
            }
        });

        return parsed;
    };

    private static parsePtz = (parsed: string[]): TCameraPTZItem[] => {
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

    private getAgent(proxyParams?: TProxyParams) {
        return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
    }
}
