import * as EventEmitter from 'events';

import { WsOptions } from './internal/common';
import { WsClient, WsClientOptions } from './node/WsClient';

export type CamScripterOptions = WsOptions;

export type TDeclaration = {
    type?: '' | 'SOURCE' | 'DATA';
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
    key_nice_name?: string;
    value_nice_name?: string;
};

export type TEventDeclaration = {
    declaration_id: string;
    stateless: boolean;
    declaration: TDeclaration[];
};

export type TEventUndeclaration = {
    declaration_id: string;
};

export type TEventData = {
    namespace: string;
    key: string;
    value: string | boolean | number;
    value_type: 'STRING' | 'INT' | 'BOOL' | 'DOUBLE';
};

export type TEvent = {
    declaration_id: string;
    event_data: TEventData[];
};

export type TResponse = {
    call_id: number;
    message: string;
};

export type TErrorResponse = {
    error: string;
    call_id?: number;
};

type TMessage = {
    call_id: number;
    command: string;
    data: unknown;
};

type TAsyncMessage = {
    resolve: (value: TResponse) => void;
    reject: (reason?: any) => void;
    sentTimestamp: number;
};

export interface CamScripterAPICameraEventsGenerator {
    on(event: 'open', listener: () => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;

    emit(event: 'open'): boolean;
    emit(event: 'close'): boolean;
    emit(event: 'error', err: Error): boolean;
}
export class CamScripterAPICameraEventsGenerator extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;
    private callId: number;
    private sendMessages: Record<number, TAsyncMessage>;
    private timeoutCheckTimer: NodeJS.Timeout | undefined;
    private wsConnected: boolean;
    private ws!: WsClient;

    constructor(options?: CamScripterOptions) {
        super();

        this.tls = options?.tls ?? false;
        this.tlsInsecure = options?.tlsInsecure ?? false;
        this.ip = options?.ip ?? '127.0.0.1';
        this.port = options?.port ?? (this.tls ? 443 : 80);
        this.user = options?.user ?? '';
        this.pass = options?.pass ?? '';

        this.callId = 0;
        this.sendMessages = {};

        this.wsConnected = false;
        this.createWsClient();

        EventEmitter.call(this);
    }

    connect() {
        this.ws.open();
        this.startMsgsTimeoutCheck();
    }

    disconnect() {
        this.ws.close();
        this.stopMsgsTimeoutCheck();
    }

    declareEvent(eventDeclaration: TEventDeclaration) {
        return this.sendMessage({
            call_id: 0,
            command: 'declare_event',
            data: eventDeclaration,
        });
    }

    undeclareEvent(eventUndeclaration: TEventUndeclaration) {
        return this.sendMessage({
            call_id: 0,
            command: 'undeclare_event',
            data: eventUndeclaration,
        });
    }

    sendEvent(event: TEvent) {
        return this.sendMessage({
            call_id: 0,
            command: 'send_event',
            data: event,
        });
    }

    private createWsClient() {
        const options: WsClientOptions = {
            user: this.user,
            pass: this.pass,
            tlsInsecure: this.tlsInsecure,
            tls: this.tls,
            ip: this.ip,
            port: this.port,
            address: `/local/camscripter/ws`,
            protocol: 'camera-events',
        };

        this.ws = new WsClient(options);

        this.ws.on('open', () => {
            this.wsConnected = true;
            this.emit('open');
        });
        this.ws.on('message', (msgData: Buffer) => this.incomingWsMessageHandler(msgData));
        this.ws.on('error', (error: Error) => {
            this.reportErr(error);
        });
        this.ws.on('close', () => {
            this.wsConnected = false;
            this.reportClose();
        });
    }

    private incomingWsMessageHandler(msgData: Buffer) {
        const dataJSON = JSON.parse(msgData.toString()) as TResponse | TErrorResponse;

        let errorResponse: TErrorResponse | undefined;
        if ('error' in dataJSON) {
            errorResponse = dataJSON as TErrorResponse;
        }

        if (dataJSON.call_id !== undefined) {
            if (errorResponse !== undefined) {
                this.sendMessages[dataJSON.call_id]?.reject(new Error(errorResponse.error));
            } else {
                this.sendMessages[dataJSON.call_id]?.resolve(dataJSON as TResponse);
            }
            delete this.sendMessages[dataJSON.call_id];
        }

        if (errorResponse !== undefined) {
            this.reconnectWithError(new Error(errorResponse.error));
        }
    }

    private sendMessage(msgJson: TMessage) {
        return new Promise<TResponse>((resolve, reject) => {
            if (!this.wsConnected) {
                throw new Error("Websocket hasn't been opened yet.");
            }
            try {
                msgJson.call_id = ++this.callId;
                this.ws.send(JSON.stringify(msgJson));
                this.sendMessages[this.callId] = { resolve, reject, sentTimestamp: Date.now() };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                const error = new Error(`Send message error: ${errorMessage}`);
                reject(error);
                this.reconnectWithError(error);
            }
        });
    }

    private startMsgsTimeoutCheck() {
        clearInterval(this.timeoutCheckTimer);
        this.timeoutCheckTimer = setInterval(() => {
            let reconnect = false;
            const now = Date.now();
            for (const callId in this.sendMessages) {
                const msg = this.sendMessages[callId];
                if (!msg) {
                    continue;
                }
                if (now - msg.sentTimestamp > 10000) {
                    reconnect = true;
                    msg.reject(new Error('Message timeout'));
                    delete this.sendMessages[callId];
                }
            }
            if (reconnect) {
                this.reconnectWithError(new Error('Message timeout'));
            }
        }, 5000);
    }

    private stopMsgsTimeoutCheck() {
        clearInterval(this.timeoutCheckTimer);
    }

    private reconnectWithError(err: Error) {
        this.reportErr(err);
        this.ws.reconnect();
    }

    private reportErr(err: Error) {
        this.emit('error', err);
    }

    private reportClose() {
        for (const callId in this.sendMessages) {
            this.sendMessages[callId]?.reject(new Error('Connection lost'));
        }
        this.sendMessages = {};
        this.emit('close');
    }
}
