import { IClient, TGetParams, TPostParams, TResponse } from './types';
import { TProxyParam } from '../types/common';
import { addParametersToPath } from './utils';

export class ProxyClient<Client extends IClient<TResponse> = IClient<TResponse>> {
    constructor(public client: Client, public getProxyUrl: () => string) {}

    get = (proxy: TProxyParam, ...args: TGetParams) => {
        const [path, parameters, headers] = args;
        const url = addParametersToPath(path, parameters);
        const { realUrl, realHeaders } = this.getReal(proxy, url, headers);
        return this.client.get(realUrl, {}, realHeaders);
    };

    post = (proxy: TProxyParam, ...args: TPostParams) => {
        const [path, data, parameters, headers] = args;
        const url = addParametersToPath(path, parameters);
        const { realUrl, realHeaders } = this.getReal(proxy, url, headers);
        return this.client.post(realUrl, data, {}, realHeaders);
    };

    private getReal = (proxy: TProxyParam, url: string, headers?: Record<string, string>): TReal => {
        if (proxy !== null) {
            return {
                realUrl: this.getProxyUrl(),
                realHeaders: {
                    ...(headers ?? {}),
                    'x-target-camera-protocol': proxy.port === 443 ? 'https' : 'http',
                    'x-target-camera-path': url,
                    'x-target-camera-ip': proxy.ip,
                    'x-target-camera-mdns': proxy.mdnsName,
                    'x-target-camera-port': String(proxy.port),
                    'x-target-camera-pass': encodeURIComponent(proxy.pass),
                    'x-target-camera-user': encodeURIComponent(proxy.user),
                },
            };
        }

        return {
            realUrl: url,
            realHeaders: headers,
        };
    };
}

type TReal = {
    realUrl: string;
    realHeaders?: Record<string, string>;
};
