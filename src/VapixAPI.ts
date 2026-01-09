import { IClient, TResponse } from './internal/types';
import { arrayToUrl, isNullish } from './internal/utils';

import {
    TGuardTour,
    TPtzOverview,
    TCameraPTZItem,
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
    guardTourSchema,
    ptzOverviewSchema,
    cameraPTZItemDataSchema,
    applicationListSchema,
    sdCardInfoSchema,
} from './types/VapixAPI';
import {
    ApplicationAPIError,
    MaxFPSError,
    NoDeviceInfoError,
    PtzNotSupportedError,
    ErrorWithResponse,
    SDCardActionError,
    SDCardJobError,
    SettingParameterError,
    TimezoneFetchError,
    TimezoneNotSetupError,
} from './errors/errors';
import { TCameraImageConfig, THttpRequestOptions } from './types/common';
import { z } from 'zod';
import { XMLParser } from 'fast-xml-parser';
import { BasicAPI } from './internal/BasicAPI';

export class VapixAPI<Client extends IClient<TResponse, any>> extends BasicAPI<Client> {
    constructor(client: Client, private CustomFormData = FormData) {
        super(client);
    }

    async getCameraImage(parameters: TCameraImageConfig, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        return (await agent.get({
            path: '/axis-cgi/jpg/image.cgi',
            parameters,
            timeout: options?.timeout,
        })) as ReturnType<Client['get']>;
    }

    async getEventDeclarations(options?: THttpRequestOptions) {
        const data =
            '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
            '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
            '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
            '</s:Body>' +
            '</s:Envelope>';
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path: '/vapix/services',
            data,
            headers: { 'Content-Type': 'application/soap+xml' },
        });
        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }
        return await res.text();
    }

    async getSupportedAudioSampleRate(options?: THttpRequestOptions) {
        const path = '/axis-cgi/audio/streamingcapabilities.cgi';
        const jsonData = { apiVersion: '1.0', method: 'list' };
        const res = await this._postJsonEncoded(path, jsonData, undefined, options);

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

            await this._postJsonEncoded('/axis-cgi/opticscontrol.cgi', data, undefined, options);
        } catch (err) {
            // lets try the old api
            await this._postUrlEncoded(
                '/axis-cgi/opticssetup.cgi',
                {
                    autofocus: 'perform',
                    source: '1',
                },
                options
            );
        }
    }

    async checkSDCard(options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/disks/list.cgi',
            {
                diskid: 'SD_DISK',
            },
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

        return sdCardInfoSchema.parse({
            totalSize: parseInt(data.totalsize),
            freeSize: parseInt(data.freesize),
            status: sdCardWatchedStatuses.includes(data.status) ? data.status : 'disconnected',
        });
    }

    mountSDCard(options?: THttpRequestOptions) {
        return this._doSDCardMountAction('MOUNT', options);
    }

    unmountSDCard(options?: THttpRequestOptions) {
        return this._doSDCardMountAction('UNMOUNT', options);
    }

    private async _doSDCardMountAction(action: 'MOUNT' | 'UNMOUNT', options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/disks/mount.cgi',
            {
                action: action,
                diskid: 'SD_DISK',
            },
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
            throw new SDCardActionError(action, job.description);
        }

        return Number(job.jobid);
    }

    // This is supposed to be called in interval in client code until progress is 100
    async fetchSDCardJobProgress(jobId: number, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/disks/job.cgi',
            {
                jobid: String(jobId),
                diskid: 'SD_DISK',
            },
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
            throw new SDCardJobError(job.description);
        }

        return Number(job.progress);
    }

    downloadCameraReport(options?: THttpRequestOptions) {
        return this._postUrlEncoded('/axis-cgi/serverreport.cgi', { mode: 'text' }, options);
    }

    getSystemLog(options?: THttpRequestOptions) {
        return this._postUrlEncoded('/axis-cgi/admin/systemlog.cgi', {}, options);
    }

    async getMaxFps(channel: number, options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'getCaptureModes' };
        const res = await this._postJsonEncoded('/axis-cgi/capturemode.cgi', data, undefined, options);
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

        return z.number().parse(captureMode.maxFPS);
    }

    async getTimezone(options?: THttpRequestOptions) {
        // try v2 api first
        try {
            const agent = this.getClient(options?.proxyParams);
            const resV2 = await agent.get({ path: '/config/rest/time/v2/timeZone', timeout: options?.timeout });

            if (!resV2.ok) {
                throw new ErrorWithResponse(resV2);
            }

            const json = await resV2.json();
            const data = timeZoneSchema.parse(json);
            if (data.status === 'error') {
                throw new TimezoneFetchError(data.error.message);
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
            throw new TimezoneNotSetupError();
        }
        return z.string().parse(data.data.timeZone);
    }

    async getDateTimeInfo(options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'getDateTimeInfo' };
        const res = await this._postJsonEncoded('/axis-cgi/time.cgi', data, undefined, options);
        return dateTimeinfoSchema.parse(await res.json());
    }

    async getDevicesSettings(options?: THttpRequestOptions): Promise<TAudioDevice[]> {
        const data = { apiVersion: '1.0', method: 'getDevicesSettings' };
        const res = await this._postJsonEncoded('/axis-cgi/audiodevicecontrol.cgi', data, undefined, options);

        const result = audioDeviceRequestSchema.parse(await res.json());
        return result.data.devices.map((device: TAudioDeviceFromRequest) => ({
            ...device,
            inputs: (device.inputs || []).sort((a, b) => a.id.localeCompare(b.id)),
            outputs: (device.outputs || []).sort((a, b) => a.id.localeCompare(b.id)),
        }));
    }

    async fetchRemoteDeviceInfo<T extends Record<string, any>>(payload: T, options?: THttpRequestOptions) {
        const res = await this._postJsonEncoded('/axis-cgi/basicdeviceinfo.cgi', payload, undefined, options);
        const json = await res.json();
        if (isNullish(json.data)) {
            throw new NoDeviceInfoError();
        }
        return json.data;
    }

    async getHeaders(options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'list' };
        const res = await this._postJsonEncoded('/axis-cgi/customhttpheader.cgi', data, undefined, options);

        return z.object({ data: z.record(z.string()) }).parse(await res.json()).data;
    }

    async setHeaders(headers: Record<string, string>, options?: THttpRequestOptions) {
        const data = { apiVersion: '1.0', method: 'set', params: headers };
        return this._postJsonEncoded('/axis-cgi/customhttpheader.cgi', data, undefined, options);
    }

    //  -------------------------------
    //            param.cgi
    //  -------------------------------

    async getParameter(paramNames: string | string[], options?: THttpRequestOptions) {
        const response = await this._postUrlEncoded(
            '/axis-cgi/param.cgi',
            {
                action: 'list',
                group: arrayToUrl(paramNames),
            },
            options
        );
        return VapixAPI.parseParameters(await response.text());
    }

    async setParameter(params: Record<string, string | number | boolean>, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/param.cgi',
            {
                ...params,
                action: 'update',
            },
            options
        );
        const responseText = await res.text();
        if (responseText.startsWith('# Error')) {
            throw new SettingParameterError(responseText);
        }
    }

    async getGuardTourList(options?: THttpRequestOptions) {
        const gTourList = new Array<TGuardTour>();
        const response = await this.getParameter('GuardTour', options);
        for (let i = 0; i < 20; i++) {
            const gTourBaseName = 'GuardTour.G' + i;
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
                    const tourBaseName = 'GuardTour.G' + i + '.Tour.T' + j;
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
        return guardTourSchema.parse(gTourList);
    }

    setGuardTourEnabled(guardTourId: string, enable: boolean, options?: THttpRequestOptions) {
        const params: Record<string, string> = {};
        params[guardTourId + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(params, options);
    }

    //  -------------------------------
    //             ptz.cgi
    //  -------------------------------

    async getPTZPresetList(channel: number, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'presetposcam',
                camera: channel,
            },
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
        return z.array(z.string()).parse(positions);
    }

    async listPTZ(camera: number, options?: THttpRequestOptions) {
        const url = `/axis-cgi/com/ptz.cgi`;
        const response = await this._postUrlEncoded(
            url,
            {
                camera,
                query: 'presetposcamdata',
                format: 'json',
            },
            options
        );

        const text = await response.text();
        if (text === '') {
            throw new PtzNotSupportedError();
        }
        return VapixAPI.parseCameraPtzResponse(text)[camera] ?? [];
    }

    async listPtzVideoSourceOverview(options?: THttpRequestOptions) {
        const response = await this._postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'presetposall',
                format: 'json',
            },
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
                const item = data[camera];
                if (item !== undefined) {
                    // convert source (sometimes called camera) to viewNumber
                    res[camera - 1] = item.map(({ data: itemData, ...d }) => d);
                }
            });
        return ptzOverviewSchema.parse(res);
    }

    goToPreset(channel: number, presetName: string, options?: THttpRequestOptions) {
        return this._postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                camera: channel.toString(),
                gotoserverpresetname: presetName,
            },
            options
        );
    }

    async getPtzPosition(camera: number, options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/com/ptz.cgi',
            {
                query: 'position',
                camera: camera.toString(),
            },
            options
        );

        const params = VapixAPI.parseParameters(await res.text());

        return cameraPTZItemDataSchema.parse({
            pan: Number(params.pan),
            tilt: Number(params.tilt),
            zoom: Number(params.zoom),
        });
    }

    //  -------------------------------
    //        portmanagement.cgi
    //  -------------------------------

    async getPorts(options?: THttpRequestOptions) {
        const res = await this._postJsonEncoded(
            '/axis-cgi/io/portmanagement.cgi',
            {
                apiVersion: '1.0',
                context: '',
                method: 'getPorts',
            },
            undefined,
            options
        );

        const portResponseParsed = getPortsResponseSchema.parse(await res.json());
        return portResponseParsed.data.items;
    }

    async setPorts(ports: TPortSetSchema[], options?: THttpRequestOptions) {
        await this._postJsonEncoded(
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
        await this._postJsonEncoded(
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
    //             pwdgrp.cgi
    //  -------------------------------

    async addCameraUser(username: string, pass: string, sgrp: string, comment?: string, options?: THttpRequestOptions) {
        return await this._postUrlEncoded(
            '/axis-cgi/pwdgrp.cgi',
            {
                action: 'add',
                user: username,
                pwd: pass,
                grp: 'users',
                sgrp,
                comment,
            },
            options
        );
    }

    async getCameraUsers(options?: THttpRequestOptions) {
        const res = await this._postUrlEncoded(
            '/axis-cgi/pwdgrp.cgi',
            {
                action: 'get',
            },
            options
        );
        return await res.text();
    }

    async editCameraUser(username: string, pass: string, options?: THttpRequestOptions) {
        return await this._postUrlEncoded(
            '/axis-cgi/pwdgrp.cgi',
            {
                action: 'update',
                user: username,
                pwd: pass,
            },
            options
        );
    }

    //  -------------------------------
    //          application API
    //  -------------------------------

    async getApplicationList(options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
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
        const appList = apps.map((app: z.infer<typeof applicationSchema>) => {
            return {
                ...app,
                appId: APP_IDS.find((id) => id.toLowerCase() === app.Name.toLowerCase()) ?? null,
            };
        });
        return applicationListSchema.parse(appList);
    }

    async startApplication(applicationId: string, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationId.toLowerCase(),
                action: 'start',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('START', text);
        }
    }

    async restartApplication(applicationId: string, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationId.toLowerCase(),
                action: 'restart',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok') {
            throw new ApplicationAPIError('RESTART', text);
        }
    }

    async stopApplication(applicationId: string, options?: THttpRequestOptions) {
        const agent = this.getClient(options?.proxyParams);
        const res = await agent.get({
            path: '/axis-cgi/applications/control.cgi',
            parameters: {
                package: applicationId.toLowerCase(),
                action: 'stop',
            },
            timeout: options?.timeout,
        });
        const text = (await res.text()).trim().toLowerCase();

        if (text !== 'ok' && !(text.startsWith('error:') && text.substring(7) === '6')) {
            throw new ApplicationAPIError('STOP', text);
        }
    }

    async installApplication(
        data: Parameters<typeof FormData.prototype.append>[1],
        fileName: string,
        options?: THttpRequestOptions
    ) {
        const formData = new this.CustomFormData();
        formData.append('packfil', data, fileName);

        const agent = this.getClient(options?.proxyParams);
        const res = await agent.post({
            path: '/axis-cgi/applications/upload.cgi',
            data: formData,
            headers: {
                contentType: 'application/octet-stream',
            },
            timeout: options?.timeout ?? 120000,
        });
        if (!res.ok) {
            throw new ErrorWithResponse(res);
        }

        const text = await res.text();
        if (text.length > 5) {
            throw new ApplicationAPIError('INSTALL', text);
        }
    }

    //   ----------------------------------------
    //                   Private
    //   ----------------------------------------

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
}
