import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { WsOptions } from '../internal/types';
import { WsClient, WsClientOptions } from './WsClient';
import { TVapixEventMessage } from '../types/VapixEvents';

export class VapixEvents extends EventEmitter {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;

    private ws!: WsClient;

    constructor(options: WsOptions = {}) {
        super();

        this.tls = options.tls ?? false;
        this.tlsInsecure = options.tlsInsecure ?? false;
        this.ip = options.ip ?? '127.0.0.1';
        this.port = options.port ?? (this.tls ? 443 : 80);
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';

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
            ip: this.ip,
            port: this.port,
            address: '/vapix/ws-data-stream?sources=events',
        };
        this.ws = new WsClient(options);

        this.ws.on('open', () => {
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
        });
        this.ws.on('message', (data: Buffer) => {
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
        });
        this.ws.on('error', (error: Error) => {
            this.emit('error', error);
        });
        this.ws.on('close', () => {
            this.emit('close');
        });
    }

    private isReservedEventName(eventName: string) {
        return eventName === 'open' || eventName === 'close' || eventName === 'error';
    }
}
