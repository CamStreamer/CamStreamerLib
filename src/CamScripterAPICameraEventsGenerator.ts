import * as EventEmitter from 'events';

import { Options } from './common';
import { WsClient, WsClientOptions } from './WsClient';

export type CamScripterOptions = Options;

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
    data: unknown;
};

type AsyncMessage = {
    resolve: (value: Response) => void;
    reject: (reason?: any) => void;
};

export class CamScripterAPICameraEventsGenerator extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private auth: string;
    private callId: number;
    private sendMessages: Record<number, AsyncMessage>;

    private ws?: WsClient;

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
            this.reportErr(err as Error);
        }
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
            if (this.ws === undefined) {
                throw new Error("Websocket hasn't been opened yet.");
            }
            try {
                this.sendMessages[this.callId] = { resolve, reject };
                msgJson.call_id = this.callId++;
                this.ws.send(JSON.stringify(msgJson));
            } catch (err) {
                this.reportErr(new Error(`Send message error: ${err}`));
            }
        });
    }

    private openWebsocket() {
        return new Promise<void>((resolve, reject) => {
            const options: WsClientOptions = {
                auth: this.auth,
                tlsInsecure: this.tlsInsecure,
                tls: this.tls,
                ip: this.ip,
                port: this.port,
                address: '/local/camscripter/ws',
                protocol: 'camera-events',
            };

            this.ws = new WsClient(options);

            this.ws.on('open', () => {
                resolve();
            });
            this.ws.on('message', (data: Buffer) => {
                const dataJSON = JSON.parse(data.toString());
                if (Object.hasOwn(dataJSON, 'call_id') && dataJSON['call_id'] in this.sendMessages) {
                    if (Object.hasOwn(dataJSON, 'error')) {
                        this.sendMessages[dataJSON['call_id']].reject(new Error(dataJSON.error));
                    } else {
                        this.sendMessages[dataJSON['call_id']].resolve(dataJSON);
                    }
                    delete this.sendMessages[dataJSON['call_id']];
                }

                if (Object.hasOwn(dataJSON, 'error')) {
                    this.reportErr(new Error(dataJSON.error));
                }
            });
            this.ws.on('error', (error: Error) => {
                this.reportErr(error);
                reject(error);
            });
            this.ws.on('close', () => {
                this.reportClose();
            });

            this.ws.open();
        });
    }

    private reportErr(err: Error) {
        this.ws!.close();
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
