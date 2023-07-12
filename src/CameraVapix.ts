import * as http from 'http';
import * as WebSocket from 'ws';
import * as prettifyXml from 'prettify-xml';
import { parseString } from 'xml2js';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { httpRequest, HttpRequestOptions } from './HttpRequest';
import { WsClient, WsClientOptions } from './wsOptions';

export type CameraVapixOptions = {
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    ip?: string;
    port?: number;
    auth?: string;
};

export type ApplicationList = {
    reply: {
        $: { result: string };
        application: {
            $: Application;
        }[];
    };
};

export type Application = {
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

export type GuardTour = {
    id: string;
    camNbr: any;
    name: string;
    randomEnabled: any;
    running: string;
    timeBetweenSequences: any;
    tour: {
        moveSpeed: any;
        position: any;
        presetNbr: any;
        waitTime: any;
        waitTimeViewType: any;
    }[];
};

export class CameraVapix extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;

    private ws: WebSocket = null;

    constructor(options?: CameraVapixOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';
    }

    async getParameterGroup(groupNames: string) {
        const response = (await this.vapixGet(
            `/axis-cgi/param.cgi?action=list&group=${encodeURIComponent(groupNames)}`
        )) as string;
        const params = {};
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

    setParameter(params: object) {
        let postData = 'action=update&';
        for (let key in params) {
            postData += key + '=' + params[key] + '&';
        }
        postData = postData.slice(0, postData.length - 1);
        return this.vapixPost('/axis-cgi/param.cgi', postData);
    }

    async getPTZPresetList(channel: string) {
        const response = (await this.vapixGet(
            `/axis-cgi/com/ptz.cgi?query=presetposcam&camera=${encodeURIComponent(channel)}`
        )) as string;
        const positions: string[] = [];
        const lines = response.split(/[\r\n]/);
        for (let line of lines) {
            if (line.length > 0 && line.indexOf('presetposno') != -1) {
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
        const gTourList = new Array<GuardTour>();
        const response = await this.getParameterGroup('GuardTour');
        for (let i = 0; i < 20; i++) {
            const gTourBaseName = 'root.GuardTour.G' + i;
            if (gTourBaseName + '.CamNbr' in response) {
                const gTour: GuardTour = {
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
        const options = {};
        options[gourTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(options);
    }

    async getInputState(port: number) {
        const response = await this.vapixPost('/axis-cgi/io/port.cgi', `checkactive=${encodeURIComponent(port)}`);
        return response.split('=')[1].indexOf('active') == 0;
    }

    setOutputState(port: number, active: boolean) {
        return this.vapixPost('/axis-cgi/io/port.cgi', `action=${encodeURIComponent(port)}:${active ? '/' : '\\'}`);
    }

    getApplicationList() {
        return new Promise<Application[]>(async (resolve, reject) => {
            const xml = (await this.vapixGet('/axis-cgi/applications/list.cgi')) as string;
            parseString(xml, (err, result: ApplicationList) => {
                if (err) {
                    reject(err);
                    return;
                }
                const apps = [];
                for (let i = 0; i < result.reply.application.length; i++) {
                    apps.push(result.reply.application[i].$);
                }
                resolve(apps);
            });
        });
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

    private isReservedEventName(eventName: string) {
        return eventName == 'eventsConnect' || eventName == 'eventsDisconnect';
    }

    eventsConnect(): void {
        if (this.ws != null) {
            throw new Error('Websocket is already opened.');
        }
        const options: WsClientOptions = {
            tls: this.tls,
            tlsInsecure: this.tlsInsecure,
            auth: this.auth,
            ip: this.ip,
            port: this.port,
            address: '/vapix/ws-data-stream?sources=events',
        };
        this.ws = new WsClient(options);

        this.ws.on('open', () => {
            const topics = [];
            const eventNames = this.eventNames();
            for (let i = 0; i < eventNames.length; i++) {
                if (!this.isReservedEventName(eventNames[i])) {
                    const topic = {
                        topicFilter: eventNames[i],
                    };
                    topics.push(topic);
                }
            }

            const topicFilter = {
                apiVersion: '1.0',
                method: 'events:configure',
                params: {
                    eventFilterList: topics,
                },
            };
            this.ws.send(JSON.stringify(topicFilter));
        });
        this.ws.on('message', (data: string) => {
            const dataJSON = JSON.parse(data);
            if (dataJSON.method === 'events:configure') {
                if (dataJSON.error === undefined) {
                    this.emit('eventsConnect');
                } else {
                    this.emit('eventsDisconnect', dataJSON.error as Error);
                    this.eventsDisconnect();
                }
                return;
            }
            const eventName: string = dataJSON.params.notification.topic;
            this.emit(eventName, dataJSON as object);
        });
        this.ws.on('error', (error: Error) => {
            this.emit('eventsDisconnect', error);
            this.ws = null;
        });
        this.ws.on('close', () => {
            if (this.ws !== null) {
                this.emit('websocketDisconnect');
            }
            this.ws = null;
        });

        this.ws.open();
    }

    eventsDisconnect() {
        if (this.ws != null) {
            this.ws.close();
        }
    }

    vapixGet(path: string, noWaitForData = false) {
        const options = this.getBaseVapixConnectionParams();
        options.path = encodeURI(path);
        return httpRequest(options, undefined, noWaitForData);
    }

    async getCameraImage(camera: string, compression: string, resolution: string, outputStream: NodeJS.WritableStream) {
        const path = `/axis-cgi/jpg/image.cgi?resolution=${resolution}&compression=${compression}&camera=${camera}`;
        const res = (await this.vapixGet(path, true)) as http.IncomingMessage;
        res.pipe(outputStream);
        return outputStream;
    }

    vapixPost(path: string, data: string, contentType?: string) {
        const options = this.getBaseVapixConnectionParams();
        options.method = 'POST';
        options.path = path;
        if (contentType != null) {
            options.headers = { 'Content-Type': contentType };
        }
        return httpRequest(options, data) as Promise<string>;
    }

    private getBaseVapixConnectionParams(): HttpRequestOptions {
        return {
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            auth: this.auth,
            rejectUnauthorized: !this.tlsInsecure,
        };
    }
}
