import { DefaultClient } from './DefaultClient';

type THttpOptions = {
    tlsInsecure?: boolean;
    keepAlive?: boolean;
};

export class DeviceConnectClient extends DefaultClient {
    constructor(deviceAccessToken: string, host: string, opt: THttpOptions = {}) {
        super({
            ...opt,
            tls: true,
            host: host,
            headers: { authorization: `Bearer ${deviceAccessToken}` },
        });
    }
}
