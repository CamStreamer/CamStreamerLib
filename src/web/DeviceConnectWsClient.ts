import { WsClient } from './WsClient';

export class DeviceConnectWsClient extends WsClient {
    constructor(deviceAccessToken: string, host: string, getPath: () => string) {
        super(() => {
            const path = getPath();
            const andChar = path.includes('?') ? '&' : '?';
            return `wss://${host}${path}${andChar}DEVICE_ACCESS_TOKEN=${deviceAccessToken}`;
        });
    }
}
