import { IWsClient } from '../internal/types';
import { WsEvents } from '../internal/WsEvents';
import {
    TEventData,
    ptrEventsSchema,
    TApiUser,
    TApiUserInput,
    apiUserInputSchema,
} from '../types/ws/PlaneTrackerEvents';

export class PlaneTrackerEvents extends WsEvents<TEventData> {
    private _apiUser: TApiUserInput;

    constructor(ws: IWsClient, apiUser: Omit<TApiUser, 'ip'>) {
        super((data: any) => ptrEventsSchema.parse(data), ws);
        // Validated here rather than in sendInitMsg: that runs as an onOpen callback, where a throw
        // surfaces far from the call site that supplied the bad value.
        this._apiUser = apiUserInputSchema.parse(apiUser);
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
