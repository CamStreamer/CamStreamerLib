import { IWebsocket } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { cswEventsSchema, TCamSwitcherEvent } from '../types/ws/CamSwitcherEvents';

export class CamSwitcherEvents<Event extends { data: string }> extends WsEvents<TCamSwitcherEvent, Event> {
    constructor(ws: IWebsocket<Event>, private getAuthToken: () => Promise<string>) {
        super(cswEventsSchema, ws);
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
