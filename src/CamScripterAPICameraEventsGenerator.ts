import * as WebSocket from 'ws';
import * as EventEmitter from 'events';

import { Digest } from './Digest';

export type CamScripterOptions = {
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
    ip?: string;
    port?: number;
    auth?: string;
};

export type Declaration = {
    type?: '' | 'SOURCE' | 'DATA';
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
    key_nice_name?: string;
    value_nice_name?: string;
};

export type EventDeclaration = {
    declaration_id: string;
    stateless: boolean;
    declaration: Declaration[];
};

export type EventUndeclaration = {
    declaration_id: string;
};

export type EventData = {
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
};

export type Event = {
    declaration_id: string;
    event_data: EventData[];
};

export type Response = {
    call_id: number;
    message: string;
};

type Message = {
    call_id: number;
    command: string;
    data: any;
};

type AsyncMessage = {
    resolve;
    reject;
};

export class CamScripterAPICameraEventsGenerator extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;

    private ws: WebSocket = null;

    constructor(options?: CamScripterOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.auth = options?.auth ?? '';

        this.callId = 0;
        this.sendMessages = {};

        EventEmitter.call(this);
    }

    async connect() {
        try {
            await this.openWebsocket();
            this.emit('open');
        } catch (err) {
            this.reportErr(err);
        }
    }

    private openWebsocket(digestHeader?: string) {
        return new Promise<void>((resolve, reject) => {
            const userPass = this.auth.split(':');
            const protocol = this.tls ? 'wss' : 'ws';
            const addr = `${protocol}://${this.ip}:${this.port}/local/camscripter/ws`;

            const options = {
                auth: this.auth,
                rejectUnauthorized: !this.tlsInsecure,
                headers: {},
            };
            if (digestHeader !== undefined) {
                options.headers['Authorization'] = Digest.getAuthHeader(
                    userPass[0],
                    userPass[1],
                    'GET',
                    '/local/camscripter/ws',
                    digestHeader
                );
            }

            this.ws = new WebSocket(addr, 'camera-events', options);
            this.ws.binaryType = 'arraybuffer';

            this.ws.isAlive = true;
            const pingTimer = setInterval(() => {
                if (this.ws.readyState !== this.ws.OPEN || this.ws.isAlive === false) {
                    return this.ws.terminate();
                }
                this.ws.isAlive = false;
                this.ws.ping();
            }, 30000);

            this.ws.on('open', () => {
                resolve();
            });

            this.ws.on('pong', () => {
                this.ws.isAlive = true;
            });

            this.ws.on('message', (data: string) => {
                const dataJSON = JSON.parse(data);
                if (dataJSON.hasOwnProperty('call_id') && dataJSON['call_id'] in this.sendMessages) {
                    if (dataJSON.hasOwnProperty('error')) {
                        this.sendMessages[dataJSON['call_id']].reject(new Error(dataJSON.error));
                    } else {
                        this.sendMessages[dataJSON['call_id']].resolve(dataJSON);
                    }
                    delete this.sendMessages[dataJSON['call_id']];
                }

                if (dataJSON.hasOwnProperty('error')) {
                    this.reportErr(new Error(dataJSON.error));
                }
            });

            this.ws.on('unexpected-response', async (req, res) => {
                if (res.statusCode === 401 && res.headers['www-authenticate'] !== undefined)
                    this.openWebsocket(res.headers['www-authenticate']).then(resolve, reject);
                else {
                    reject('Error: status code: ' + res.statusCode + ', ' + res.data);
                }
            });

            this.ws.on('error', (error: Error) => {
                this.reportErr(error);
                reject(error);
            });

            this.ws.on('close', () => {
                clearInterval(pingTimer);
                this.reportClose();
            });
        });
    }

    declareEvent(eventDeclaration: EventDeclaration) {
        return this.sendMessage({
            call_id: 0,
            command: 'declare_event',
            data: eventDeclaration,
        });
    }

    undeclareEvent(eventUndeclaration: EventUndeclaration) {
        return this.sendMessage({
            call_id: 0,
            command: 'undeclare_event',
            data: eventUndeclaration,
        });
    }

    sendEvent(event: Event) {
        return this.sendMessage({
            call_id: 0,
            command: 'send_event',
            data: event,
        });
    }

    private sendMessage(msgJson: Message) {
        return new Promise<Response>((resolve, reject) => {
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson.call_id = this.callId++;
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportErr(new Error(`Send message error: ${err}`));
            }
        });
    }

    private reportErr(err: Error) {
        this.ws?.terminate();
        this.emit('error', err);
    }

    private reportClose() {
        for (const callId in this.sendMessages) {
            this.sendMessages[callId].reject(new Error('Connection lost'));
        }
        this.sendMessages = {};
        this.emit('close');
    }
}
