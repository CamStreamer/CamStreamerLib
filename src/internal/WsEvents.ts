import { IWsClient } from './types';

// Note: we cant use EventTarget (only in browser) or EventEmitter (only in nodejs) => our custom implementation
type TEventType<T extends { type: string }> = T extends { type: infer Type } ? Type : never;
type TEvent<T extends { type: string }, Type extends TEventType<T>> = T extends { type: Type } ? T : never;
type TZodSchema<T extends { type: string }> = {
    parse: (data: string) => { type: 'init'; data: TEvent<T, TEventType<T>> } | TEvent<T, TEventType<T>>;
};

type TListenerFunction<T extends { type: string }, Type extends TEventType<T>> = (
    data: TEvent<T, Type>,
    isInit: boolean
) => void;
type TListenersList<T extends { type: string }> = Partial<{
    [K in TEventType<T>]: { [id: string]: TListenerFunction<T, K> };
}>;

export class WsEvents<T extends { type: string }, Event extends { data: string }> {
    private _isDestroyed = false;
    private listeners: TListenersList<T> = {};

    constructor(private zodSchema: TZodSchema<T>, public ws: IWsClient<Event>) {
        this.ws.onMessage = (e: Event) => this.onMessage(e);
    }

    get isDestroyed() {
        return this._isDestroyed;
    }

    resendInitData() {
        const request = {
            command: 'sendInitData',
        };
        this.ws.send(JSON.stringify(request));
    }

    addListener<Type extends TEventType<T>>(type: Type, listener: TListenerFunction<T, Type>, id: string) {
        const typeList = this.listeners[type];
        if (typeList === undefined) {
            this.listeners[type] = { [id]: listener };
            return;
        }
        typeList[id] = listener;
    }

    removeListener<Type extends TEventType<T>>(type: Type, id: string): void {
        const typeList = this.listeners[type];
        if (typeList) {
            delete typeList[id];
            if (Object.keys(typeList).length === 0) {
                delete this.listeners[type];
            }
        }
    }

    private onMessage(evt: { data: string }) {
        if (this.isDestroyed) {
            return;
        }

        try {
            const eventData = JSON.parse(evt.data);
            const data = this.zodSchema.parse(eventData);
            if (isInitEvent(data)) {
                this.processMessage(data.data, true);
                return;
            }
            this.processMessage(data, false);
        } catch (error) {
            console.error('Error parsing event data:', evt.data, error);
        }
    }

    private processMessage(event: TEvent<T, TEventType<T>>, isInit: boolean) {
        const listeners = this.listeners[event.type];
        const list = Object.values(listeners ?? {});
        list.forEach((listener) => listener(event, isInit));
    }

    destroy() {
        this._isDestroyed = true;
        this.ws.onMessage = () => {};
        this.ws.onOpen = () => Promise.reject(new Error('Websocket is destroyed'));
        this.ws.destroy();
        this.listeners = {};
    }
}

const isInitEvent = <T extends { type: string }>(
    event: T | { type: 'init'; data: T }
): event is { type: 'init'; data: TEvent<T, TEventType<T>> } => {
    return event.type === 'init';
};
