import { IWsClient } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { TEventData, ptrEventsSchema, TApiUser } from '../types/ws/PlaneTrackerEvents';

export class PlaneTrackerEvents extends WsEvents<TEventData> {
    constructor(ws: IWsClient, private _apiUser: Omit<TApiUser, 'ip'>) {
        super((data: any) => ptrEventsSchema.parse(data), ws);
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
