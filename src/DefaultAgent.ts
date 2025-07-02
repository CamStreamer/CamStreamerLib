import { IClient, HttpOptions } from './internal/common';
import { AgentOptions, HttpRequestOptions, HttpRequestSender } from './internal/HttpRequestSender';

export class DefaultAgent implements IClient {
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

    async get(
        path: string,
        parameters: Record<string, string> = {},
        headers?: Record<string, string>,
        timeout?: number
    ) {
        const options = this.getBaseConnectionParams('GET', path, parameters, timeout);
        options.headers = headers;
        return this.httpRequestSender.sendRequest(options);
    }
    async post(
        path: string,
        data: string | Buffer | FormData,
        parameters: Record<string, string> = {},
        headers?: Record<string, string>,
        timeout?: number
    ) {
        const options = this.getBaseConnectionParams('POST', path, parameters, timeout);
        options.headers = headers;
        return this.httpRequestSender.sendRequest(options, data);
    }

    private getBaseConnectionParams(
        method: string,
        path: string,
        params: Record<string, string>,
        timeout?: number
    ): HttpRequestOptions {
        if (path.indexOf('?') === -1) {
            path += '?';
        } else {
            path += '&';
        }

        for (const key in params) {
            path += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
        }
        path = path.slice(0, path.length - 1);

        return {
            method: method,
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            path: path,
            user: this.user,
            pass: this.pass,
            timeout,
        };
    }
}
