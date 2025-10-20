import { IWebsocket } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { cswEventsSchema, TCamSwitcherEvent } from '../types/ws/CamSwitcherEvents';

export class CamSwitcherEvents<Event extends { data: string }> extends WsEvents<TCamSwitcherEvent, Event> {
    constructor(ws: IWebsocket<Event>) {
        super(cswEventsSchema, ws);
    }
}
