import { WsClient } from './WsClient';

type TWsClientOptions = {
    path: string;
    headers?: Record<string, string>;
    tlsInsecure?: boolean;
    pingInterval?: number;
    protocol?: string;
};

export class DeviceConnectWsClient extends WsClient {
    constructor(deviceAccessToken: string, host: string, opt: TWsClientOptions) {
        super({
            ...opt,
            tls: true,
            host: host,
            address: opt.path,
        });

        this.wsOptions = {
            auth: undefined,
            rejectUnauthorized: !opt.tlsInsecure,
            headers: { ...opt.headers, authorization: `Token ${deviceAccessToken}` },
        };
    }
}
