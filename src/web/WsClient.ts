import { IWebsocket } from '../internal/types';

const REFRESH_TIMEOUT = 5_000;

export class WsClient implements IWebsocket<MessageEvent> {
    isDestroyed = false;
    private ws: WebSocket | null = null;
    private restartTimeout: number | null = null;

    constructor(private getUrl: () => string) {}

    init() {
        if (this.isDestroyed) {
            return;
        }
        this.destroyWebsocket();

        const ws = new WebSocket(this.getUrl(), 'events');
        ws.onopen = async () => {
            try {
                await this.onOpen();
            } catch (error) {
                console.error('Error on open:', error);
                ws.close();
            }
        };
        ws.onmessage = (e) => this.onMessage(e);
        ws.onclose = () => {
            this.restartTimeout = window.setTimeout(() => this.init(), REFRESH_TIMEOUT);
        };
        this.ws = ws;
    }

    send = (msg: string) => {
        this.ws?.send(msg);
    };

    // set by WsEvents
    onMessage = (_: MessageEvent) => {};
    onOpen = () => Promise.resolve();

    destroy = () => {
        this.isDestroyed = true;
        this.destroyWebsocket();
    };

    private destroyWebsocket() {
        if (this.restartTimeout !== null) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }

        if (!this.ws) {
            return;
        }
        this.ws.onmessage = null;
        this.ws.onopen = null;
        this.ws.onclose = null;
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
        }
        this.ws = null;
    }
}
