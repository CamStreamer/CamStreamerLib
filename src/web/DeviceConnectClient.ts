import { DefaultClient } from './DefaultClient';

export class DeviceConnectClient extends DefaultClient {
    constructor(deviceAccessToken: string, host: string) {
        super(`https://${host}`, { authorization: `Bearer ${deviceAccessToken}` });
    }
}
