import { IWebsocket } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { TApiUser } from '../types/PlaneTrackerAPI';
import { TPlaneTrackerEvent, ptrEventsSchema } from '../types/ws/PlaneTrackerEvents';

export class PlaneTrackerEvents<Event extends { data: string }> extends WsEvents<TPlaneTrackerEvent, Event> {
    constructor(ws: IWebsocket<Event>, private _apiUser: TApiUser) {
        super(ptrEventsSchema, ws);
        this.ws.onOpen = this.sendInitMsg;
    }

    private sendInitMsg = () => {
        this.ws.send(
            JSON.stringify({
                type: 'USER_INFO',
                userId: this._apiUser.userId,
                userName: this._apiUser.userName,
                userPriority: this._apiUser.userPriority,
            })
        );
    };
}
