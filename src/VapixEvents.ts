import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { WsOptions } from './internal/common';
import { WsClient, WsClientOptions } from './internal/WsClient';

export type VapixEventsOptions = WsOptions;

export class VapixEvents extends EventEmitter {
    private ws?: WsClient;

    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;

    constructor(options: VapixEventsOptions = {}) {
        super();

        this.tls = options.tls ?? false;
        this.tlsInsecure = options.tlsInsecure ?? false;
        this.ip = options.ip ?? '127.0.0.1';
        this.port = options.port ?? (this.tls ? 443 : 80);
        this.user = options.user ?? 'root';
        this.pass = options.pass ?? '';

        EventEmitter.call(this);
    }

    connect(): void {
        if (this.ws !== undefined) {
            throw new Error('Websocket is already opened.');
        }
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
            this.ws?.send(JSON.stringify(topicFilter));
        });
        this.ws.on('message', (data: Buffer) => {
            const dataJSON = JSON.parse(data.toString());
            if (dataJSON.method === 'events:configure') {
                if (dataJSON.error === undefined) {
                    this.emit('eventsConnect');
                } else {
                    this.emit('eventsDisconnect', dataJSON.error as Error);
                    this.disconnect();
                }
                return;
            }
            const eventName: string = dataJSON.params.notification.topic;
            this.emit(eventName, dataJSON as object);
        });
        this.ws.on('error', (error: Error) => {
            this.emit('eventsDisconnect', error);
            this.ws = undefined;
        });
        this.ws.on('close', () => {
            if (this.ws !== undefined) {
                this.emit('eventsClose');
            }
            this.ws = undefined;
        });

        this.ws.open();
    }

    disconnect() {
        if (this.ws !== undefined) {
            this.ws.close();
        }
    }

    private isReservedEventName(eventName: string) {
        return eventName === 'eventsConnect' || eventName === 'eventsDisconnect' || eventName === 'eventsClose';
    }
}
