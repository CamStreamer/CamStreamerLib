import * as prettifyXml from 'prettify-xml';
import { parseStringPromise } from 'xml2js';
import { WritableStream } from 'node:stream/web';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { HttpOptions, IClient, isClient } from './internal/common';
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

export class CameraVapix extends EventEmitter {
    private client: IClient;

    constructor(options: CameraVapixOptions | IClient = {}) {
        super();

        if (isClient(options)) {
            this.client = options;
        } else {
            this.client = new DefaultAgent(options);
        }
    }

    vapixGet(path: string) {
        return this.client.get(path);
    }

    vapixPost(path: string, data: string, contentType?: string) {
        let headers = {};
        if (contentType !== undefined) {
            headers = { 'Content-Type': contentType };
        }
        return this.client.post(path, data, {}, headers);
    }

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

    async getPTZPresetList(channel: string) {
        const response = await (
            await this.vapixGet(`/axis-cgi/com/ptz.cgi?query=presetposcam&camera=${encodeURIComponent(channel)}`)
        ).text();
        const positions: string[] = [];
        const lines = response.split(/[\r\n]/);
        for (const line of lines) {
            if (line.length > 0 && line.indexOf('presetposno') !== -1) {
                const p = line.split('=');
                if (p.length >= 2) {
                    positions.push(p[1]);
                }
            }
        }
        return positions;
    }

    goToPreset(channel: number, presetName: string) {
        return this.vapixPost(
            '/axis-cgi/com/ptz.cgi',
            `camera=${encodeURIComponent(channel)}&gotoserverpresetname=${encodeURIComponent(presetName)}`
        );
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

    async getInputState(port: number) {
        const response = await (
            await this.vapixPost('/axis-cgi/io/port.cgi', `checkactive=${encodeURIComponent(port)}`)
        ).text();
        return response.split('=')[1].indexOf('active') === 0;
    }

    setOutputState(port: number, active: boolean) {
        return this.vapixPost('/axis-cgi/io/port.cgi', `action=${encodeURIComponent(port)}:${active ? '/' : '\\'}`);
    }

    async getApplicationList() {
        const xml = await this.vapixGet('/axis-cgi/applications/list.cgi');
        const result = (await parseStringPromise(xml)) as TApplicationList;

        const apps = [];
        for (let i = 0; i < result.reply.application.length; i++) {
            apps.push(result.reply.application[i].$);
        }
        return apps;
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
        const declarations = await this.vapixPost('/vapix/services', data, 'application/soap+xml');
        return prettifyXml(declarations) as string;
    }
}
