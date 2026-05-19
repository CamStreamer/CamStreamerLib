import { IWsClient } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import { TEventData, wsUserActionData, ptrEventsSchema, TStringApiUser } from '../types/ws/PlaneTrackerEvents';

export class PlaneTrackerEvents extends WsEvents<TEventData> {
    constructor(ws: IWsClient, private _apiUser: TStringApiUser) {
        super((data: any) => {
            const parsedData = ptrEventsSchema.parse(data);

            if (parsedData.type === 'USER_ACTION') {
                const { type, ...actionData } = parsedData;
                const userAction = wsUserActionData.parse(actionData);
                return { ...userAction, type };
            }

            return parsedData;
        }, ws);
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
