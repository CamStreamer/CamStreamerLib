import { IClient, HttpOptions } from '../internal/common';
import { AgentOptions, HttpRequestOptions, HttpRequestSender } from './HttpRequestSender';
import { FormData as UndiciFormData } from 'undici';

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

    get url() {
        return `${this.tls ? 'https' : 'http'}://${this.user}:${this.pass}@${this.ip}:${this.port}`;
    }

    async get(path: string, parameters: Record<string, string> = {}, headers?: Record<string, string>) {
        const options = this.getBaseConnectionParams('GET', path, parameters);
        options.headers = headers;
        return this.httpRequestSender.sendRequest(options);
    }

    async post(
        path: string,
        data: string | FormData | Buffer,
        parameters: Record<string, string> = {},
        headers?: Record<string, string>
    ) {
        const options = this.getBaseConnectionParams('POST', path, parameters);
        options.headers = headers;
        return this.httpRequestSender.sendRequest(options, data as UndiciFormData);
    }

    private getBaseConnectionParams(method: string, path: string, params: Record<string, string>): HttpRequestOptions {
        let pathName = path;

        if (pathName.indexOf('?') === -1) {
            pathName += '?';
        } else {
            pathName += '&';
        }

        for (const key in params) {
            pathName += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
        }
        pathName = pathName.slice(0, pathName.length - 1);

        return {
            method: method,
            protocol: this.tls ? 'https:' : 'http:',
            host: this.ip,
            port: this.port,
            path: pathName,
            user: this.user,
            pass: this.pass,
        };
    }
}
