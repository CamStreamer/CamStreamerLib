import { IWebsocket } from './internal/types';
import {
    cswEventsSchema,
    TCamSwitcherEvent,
    TCamSwitcherEventOfType,
    TCamSwitcherEventType,
} from './types/CamSwitcherEvents';

// Note: we cant use EventTarget (only in browser) or EventEmitter (only in nodejs)
type TListenerFunction<T extends TCamSwitcherEventType> = (data: TCamSwitcherEventOfType<T>, isInit: boolean) => void;
type TListener<T extends TCamSwitcherEventType> = { [id: string]: TListenerFunction<T> };
type TListenerList = Partial<{
    [K in TCamSwitcherEventType]: TListener<K>;
}>;

export class CamSwitcherEvents<Event extends { data: string }> {
    isDestroyed = false;
    private ws: IWebsocket<Event> | null = null;
    private listeners: TListenerList = {};

    setWebsocket(ws: IWebsocket<Event>) {
        if (this.ws) {
            this.ws.destroy();
        }
        this.ws = ws;
        this.ws.onmessage = (e) => this.onMessage(e);
    }

    resendInitData() {
        const request = {
            command: 'sendInitData',
        };
        this.ws?.send(JSON.stringify(request));
    }

    addListener<T extends TCamSwitcherEventType>(type: T, listener: TListenerFunction<T>, id: string) {
        const typeList = this.listeners[type];
        if (typeList === undefined) {
            this.listeners[type] = { [id]: listener } as any;
            return;
        }
        typeList[id] = listener;
    }

    removeListener<T extends TCamSwitcherEventType>(type: T, id: string): void {
        const typeList = this.listeners[type];
        if (typeList) {
            delete typeList[id];
        }
    }

    private onMessage(evt: { data: string }) {
        if (this.isDestroyed) {
            return;
        }

        try {
            const eventData = JSON.parse(evt.data);
            const data = cswEventsSchema.parse(eventData);
            if (data.type === 'init') {
                this.processMessage(data.data, true);
                return;
            }
            this.processMessage(data, false);
        } catch (error) {
            console.error('Error parsing event data:', evt.data, error);
        }
    }

    private processMessage(event: TCamSwitcherEvent, isInit: boolean) {
        const listeners = this.listeners[event.type];
        const list = Object.values(listeners ?? {});
        list.forEach((listener) => listener(event, isInit));
    }

    destroy() {
        this.isDestroyed = true;
        if (this.ws) {
            this.ws.destroy();
            this.ws = null;
        }
        this.listeners = {};
    }
}
