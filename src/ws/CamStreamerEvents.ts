import { IWsClient } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { csEventsSchema, TCamStreamerEvent } from '../types/ws/CamStreamerEvents';

export class CamStreamerEvents extends WsEvents<TCamStreamerEvent> {
    constructor(ws: IWsClient, private getAuthToken: () => Promise<string>) {
        super((data: any) => csEventsSchema.parse(data), ws);
        this.ws.onOpen = this.sendInitMsg;
    }

    private sendInitMsg = async () => {
        try {
            const token = await this.getAuthToken();
            this.ws.send(JSON.stringify({ authorization: token }));
        } catch (error) {
            console.error('Error on open:', error);
            this.ws.reconnect();
        }
    };
}
