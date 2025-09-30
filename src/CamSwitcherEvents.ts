import { WsEvents } from './internal/WsEvents';
import { cswEventsSchema, TCamSwitcherEvent } from './types/CamSwitcherEvents';

export class CamSwitcherEvents extends WsEvents<TCamSwitcherEvent, { data: string }> {
    constructor() {
        super(cswEventsSchema);
    }
}
