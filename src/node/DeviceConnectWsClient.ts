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
        const andChar = opt.path.includes('?') ? '&' : '?';
        super({
            ...opt,
            tls: true,
            host: host,
            address: `${opt.path}${andChar}DEVICE_ACCESS_TOKEN=${deviceAccessToken}`,
        });

        this.wsOptions = {
            auth: undefined,
            rejectUnauthorized: !opt.tlsInsecure,
            headers: { ...opt.headers },
        };
    }
}
