import { EventEmitter } from 'events';

import { Options } from '../internal/types';
import { WsClient, WsClientOptions } from './WsClient';
import {
    TAsyncMessage,
    TCamScripterErrorResponse,
    TCamScripterEvent,
    TEventDeclaration,
    TEventUndeclaration,
    TCamScripterMessage,
    TCamScripterResponse,
} from '../types/CamScripterAPICameraEventsGenerator';

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

    constructor(options?: Options) {
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
        this.ws.destroy();
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

    sendEvent(event: TCamScripterEvent) {
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

        this.ws.onOpen = () => {
            this.wsConnected = true;
            this.emit('open');
        };
        this.ws.onMessage = (data) => this.incomingWsMessageHandler(data.toString());
        this.ws.onError = (error: Error) => {
            this.reportErr(error);
        };
        this.ws.onClose = () => {
            this.wsConnected = false;
            this.reportClose();
        };
    }

    private incomingWsMessageHandler(msgData: string) {
        const dataJSON = JSON.parse(msgData) as TCamScripterResponse | TCamScripterErrorResponse;

        let errorResponse: TCamScripterErrorResponse | undefined;
        if ('error' in dataJSON) {
            errorResponse = dataJSON as TCamScripterErrorResponse;
        }

        if (dataJSON.call_id !== undefined) {
            if (errorResponse !== undefined) {
                this.sendMessages[dataJSON.call_id]?.reject(new Error(errorResponse.error));
            } else {
                this.sendMessages[dataJSON.call_id]?.resolve(dataJSON as TCamScripterResponse);
            }
            delete this.sendMessages[dataJSON.call_id];
        }

        if (errorResponse !== undefined) {
            this.reconnectWithError(new Error(errorResponse.error));
        }
    }

    private sendMessage(msgJson: TCamScripterMessage) {
        return new Promise<TCamScripterResponse>((resolve, reject) => {
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
