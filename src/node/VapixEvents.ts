import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { Options } from '../internal/types';
import { WsClient, WsClientOptions } from './WsClient';
import { TVapixEventMessage } from '../types/VapixEvents';

export class VapixEvents extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private host: string;
    private port: number;
    private user: string;
    private pass: string;
    private headers?: Record<string, string>;

    private ws!: WsClient;

    constructor(options: Options = {}) {
        super();

        this.tls = options.tls ?? false;
        this.tlsInsecure = options.tlsInsecure ?? false;
        // eslint-disable-next-line deprecation/deprecation
        this.host = options.host ?? options.ip ?? '127.0.0.1';
        this.port = options.port ?? (this.tls ? 443 : 80);
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';
        this.headers = options.headers;

        this.createWsClient();

        EventEmitter.call(this);
    }

    connect(): void {
        this.ws.open();
    }

    disconnect() {
        this.ws.destroy();
    }

    private createWsClient() {
        const options: WsClientOptions = {
            tls: this.tls,
            tlsInsecure: this.tlsInsecure,
            user: this.user,
            pass: this.pass,
            host: this.host,
            port: this.port,
            address: '/vapix/ws-data-stream?sources=events',
            headers: this.headers,
        };
        this.ws = new WsClient(options);

        this.ws.onOpen = () => {
            const topics = [];
            const eventNames = this.eventNames();
            for (const eventName of eventNames) {
                if (!this.isReservedEventName(eventName)) {
                    const topic = {
                        topicFilter: eventName,
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
        };
        this.ws.onMessage = (data) => {
            const dataJSON = JSON.parse(data.toString());
            if (dataJSON.method === 'events:configure') {
                if (dataJSON.error === undefined) {
                    this.emit('open');
                } else {
                    this.emit('error', dataJSON.error as Error);
                    this.disconnect();
                }
                return;
            }
            const eventName: string = dataJSON.params.notification.topic;
            this.emit(eventName, dataJSON as TVapixEventMessage);
        };
        this.ws.onError = (error: Error) => {
            this.emit('error', error);
        };
        this.ws.onClose = () => {
            this.emit('close');
        };
    }

    private isReservedEventName(eventName: string) {
        return eventName === 'open' || eventName === 'close' || eventName === 'error';
    }
}
