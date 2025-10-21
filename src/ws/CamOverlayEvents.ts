import { IWsClient } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { coEventsSchema, TCamOverlayEvent } from '../types/ws/CamOverlayEvents';

export class CamOverlayEvents<Event extends { data: string }> extends WsEvents<TCamOverlayEvent, Event> {
    constructor(ws: IWsClient<Event>, private getAuthToken: () => Promise<string>) {
        super(coEventsSchema, ws);
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
