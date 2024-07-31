import { Options, IClient } from './common';
import { sendRequest, HttpRequestOptions } from './HttpRequest';

function isBrowserEnvironment(): boolean {
    return typeof process === 'undefined' || process.versions === null || process.versions.node === null;
}

export class DefaultAgent implements IClient {
    private tls: boolean;
    private tlsInsecure: boolean;
    private ip: string;
    private port: number;
    private user: string;
    private pass: string;

    constructor(opt: Options = {}) {

        if (isBrowserEnvironment() && opt.tlsInsecure) {
            throw new Error("HTTPS insecure can't be used on the frontend side.");
        }

        this.tls = opt.tls ?? false;
        this.tlsInsecure = opt?.tlsInsecure ?? false;
        this.ip = opt?.ip ?? '127.0.0.1';
        this.port = opt?.port ?? (this.tls ? 443 : 80);
        this.user = opt?.user ?? '';
        this.pass = opt?.pass ?? '';
    }

    private getBaseConnectionParams(method: string, path: string, params: Record<string, string>): HttpRequestOptions {
        if (path.indexOf('?') === -1) {
            path += '?';
        } else {
            path += '&';
        }

        for (const key in params) {
            path += `${key}=${params[key]}&`;
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
            rejectUnauthorized: !this.tlsInsecure,
        };
    }

    async get(url: string, parameters: Record<string, string> = {}, headers?: Record<string, string>) {
        const options = this.getBaseConnectionParams('GET', url, parameters);
        options.headers = headers;
        return sendRequest(options);
    }
    async post(
        url: string,
        data: string | Buffer,
        parameters: Record<string, string> = {},
        headers?: Record<string, string>
    ) {
        const options = this.getBaseConnectionParams('POST', url, parameters);
        options.headers = headers;
        return sendRequest(options, data);
    }
}
