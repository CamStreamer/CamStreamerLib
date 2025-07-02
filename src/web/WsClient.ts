const REFRESH_TIMEOUT = 5_000;

export class WsClient {
    isDestroyed = false;
    private ws: WebSocket | null = null;
    private restartTimeout: NodeJS.Timeout | null = null;

    constructor(private getUrl: () => string, private getAuthToken: () => Promise<string>) {}

    init() {
        if (this.isDestroyed) {
            return;
        }
        this.destroyWebsocket();

        const ws = new WebSocket(this.getUrl(), 'events');
        ws.onopen = async () => {
            try {
                const token = await this.getAuthToken();
                ws.send(JSON.stringify({ authorization: token }));
            } catch (error) {
                console.error('Error sending auth token:', error);
                ws.close();
            }
        };
        ws.onmessage = (e) => this.onmessage(e);
        ws.onclose = () => {
            this.restartTimeout = setTimeout(() => this.init(), REFRESH_TIMEOUT);
        };
        this.ws = ws;
    }

    send = (msg: string) => {
        this.ws?.send(msg);
    };

    onmessage = (_: MessageEvent) => {};

    destroy = () => {
        this.isDestroyed = true;
        this.destroyWebsocket();
    };

    private destroyWebsocket() {
        if (this.restartTimeout) {
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
