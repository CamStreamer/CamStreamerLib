import { IWebsocket } from '../internal/common';
import { WsClient, WsClientOptions } from './WsClient';

type TEvent = { data: string };

export class WsEventClient implements IWebsocket<TEvent> {
    private wsClient: WsClient;

    constructor(options: WsClientOptions) {
        this.wsClient = new WsClient(options);
        this.wsClient.on('message', (data: Buffer) => {
            this.onmessage?.({ data: data.toString() });
        });
    }

    send = (data: string) => {
        this.wsClient.send(data);
    };

    destroy = () => {
        this.wsClient.close();
        this.onmessage = null;
    };

    onmessage: ((event: TEvent) => void) | null = null;
}
