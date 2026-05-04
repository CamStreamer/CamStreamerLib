import { IClient, TGetParams, TResponse } from './types';
import { TProxyParams } from '../types/common';
import { addParametersToPath } from './utils';

// we are not limmiting Data type here, because ProxyClient takes it from client
export class ProxyClient<Client extends IClient<TResponse, any>> {
    constructor(private client: Client, private proxyParams: TProxyParams) {}

    get(params: TGetParams) {
        const { path, parameters, headers, timeout } = params;
        const targetPath = addParametersToPath(path, parameters);
        const { realPath, realHeaders } = this.getReal(targetPath, headers);
        return this.client.get({ path: realPath, headers: realHeaders, timeout }) as ReturnType<Client['get']>;
    }

    post(params: Parameters<Client['post']>[0]) {
        const { path, data, parameters, headers, timeout } = params;
        const targetPath = addParametersToPath(path, parameters);
        const { realPath, realHeaders } = this.getReal(targetPath, headers);
        return this.client.post({ path: realPath, data, headers: realHeaders, timeout }) as ReturnType<Client['post']>;
    }

    private getReal(targetPath: string, headers: Record<string, string> | undefined) {
        return {
            realPath: this.proxyParams.path,
            realHeaders: {
                ...(headers ?? {}),
                'x-target-camera-protocol': this.proxyParams.target.port === 443 ? 'https' : 'http',
                'x-target-camera-path': targetPath,
                'x-target-camera-ip': this.proxyParams.target.ip,
                'x-target-camera-mdns': this.proxyParams.target.mdnsName,
                'x-target-camera-port': String(this.proxyParams.target.port),
                'x-target-camera-pass': this.proxyParams.target.pass,
                'x-target-camera-user': this.proxyParams.target.user,
            },
        };
    }
}
