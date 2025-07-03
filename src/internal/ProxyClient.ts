import { IClient, TParameters } from './common';
import { TProxyParam } from '../types/common';

export class ProxyClient {
    constructor(public client: IClient, public getProxyUrl: () => string) {}

    get = (proxy: TProxyParam, path: string, parameters?: TParameters, headers: Record<string, string> = {}) => {
        const url = this.getPathWithParams(path, parameters);
        const { realUrl, realHeaders } = this.getReal(proxy, url, headers);
        return this.client.get(realUrl, {}, realHeaders);
    };

    post = (
        proxy: TProxyParam,
        path: string,
        data: string | Buffer | FormData,
        parameters?: TParameters,
        headers?: Record<string, string>
    ) => {
        const url = this.getPathWithParams(path, parameters);
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

    private getPathWithParams(path: string, params: TParameters = {}): string {
        let pathName = path;

        if (pathName.indexOf('?') === -1) {
            pathName += '?';
        } else {
            pathName += '&';
        }

        for (const key in params) {
            pathName += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
        }
        return pathName.slice(0, pathName.length - 1);
    }
}

type TReal = {
    realUrl: string;
    realHeaders?: Record<string, string>;
};
