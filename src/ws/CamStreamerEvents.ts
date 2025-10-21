import { IWebsocket } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { csEventsSchema, TCamStreamerEvent } from '../types/ws/CamStreamerEvents';

export class CamStreamerEvents<Event extends { data: string }> extends WsEvents<TCamStreamerEvent, Event> {
    constructor(ws: IWebsocket<Event>, private getAuthToken: () => Promise<string>) {
        super(csEventsSchema, ws);
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
