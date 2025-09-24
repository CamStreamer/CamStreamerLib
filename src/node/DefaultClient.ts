import { IClient, HttpOptions, TParameters, TGetParams, TPostParams } from '../internal/types';
import { addParametersToPath } from '../internal/utils';
import { AgentOptions, HttpRequestOptions, HttpRequestSender } from './HttpRequestSender';
import { FormData as UndiciFormData, Response as UndiciResponse } from 'undici';

export class DefaultClient implements IClient<UndiciResponse> {
    private tls: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;
    private httpRequestSender: HttpRequestSender;

    constructor(opt: HttpOptions = {}) {
        this.tls = opt.tls ?? false;
        this.ip = opt.ip ?? '127.0.0.1';
        this.port = opt.port ?? (this.tls ? 443 : 80);
        this.user = opt.user ?? '';
        this.pass = opt.pass ?? '';

        let agentOptions: AgentOptions | undefined;
        if (opt.tlsInsecure !== undefined || opt.keepAlive !== undefined) {
            agentOptions = {
                rejectUnaurhorized: !opt.tlsInsecure,
                keepAlive: opt.keepAlive,
            };
        }
        this.httpRequestSender = new HttpRequestSender(agentOptions);
    }

    get = (params: TGetParams) => {
        const { path, parameters, headers, timeout } = params;
        const options = this.getBaseConnectionParams('GET', path, parameters, headers, timeout);
        return this.httpRequestSender.sendRequest(options);
    };

    post = (params: TPostParams) => {
        const { path, data, parameters, headers, timeout } = params;
        const options = this.getBaseConnectionParams('POST', path, parameters, headers, timeout);
        return this.httpRequestSender.sendRequest(options, data as UndiciFormData);
    };

    private getBaseConnectionParams(
        method: string,
        path: string,
        params: TParameters | undefined,
        headers: Record<string, string> | undefined,
        timeout: number | undefined
    ): HttpRequestOptions {
        return {
            method: method,
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            path: addParametersToPath(path, params),
            user: this.user,
            pass: this.pass,
            headers,
            timeout,
        };
    }
}
