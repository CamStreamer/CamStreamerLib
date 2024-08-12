import { Digest } from './Digest';
import { Agent, fetch as undiciFetch, Request as UndiciRequest } from 'undici';
import { isBrowserEnvironment } from './common';

export type HttpRequestOptions = {
    method?: string;
    protocol: string;
    host: string;
    port: number;
    path: string;
    user?: string;
    pass?: string;
    timeout?: number;
    headers?: Record<string, string>;
};

export type AgentOptions = {
    rejectUnaurhorized?: boolean;
    keepAlive?: boolean;
};

type AuthData = {
    host: string;
    port: number;
    user: string;
    pass: string;
    authHeader: string;
};

export class HttpRequestSender {
    private agent?: Agent;
    private authData?: AuthData;

    constructor(agentOptions?: AgentOptions) {
        if (isBrowserEnvironment()) {
            if (agentOptions !== undefined) {
                throw new Error('Agent options can be specified only in Node.js environment.');
            }
        } else {
            this.agent = new Agent({
                connect: { rejectUnauthorized: agentOptions?.rejectUnaurhorized, keepAlive: agentOptions?.keepAlive },
            });
        }
    }

    sendRequest(options: HttpRequestOptions, postData?: Buffer | string | FormData) {
        return this.sendRequestWithAuth(options, postData);
    }

    private async sendRequestWithAuth(
        options: HttpRequestOptions,
        postData?: Buffer | string | FormData,
        wwwAuthenticateHeader?: string
    ): Promise<Response> {
        const url = HttpRequestSender.getURL(options);
        const controller = new AbortController();
        if (options.timeout !== undefined) {
            setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);
        }

        const authData = this.getAuthorization(options, wwwAuthenticateHeader);
        if (authData) {
            options.headers ??= {};
            options.headers['Authorization'] = authData.authHeader;
        }

        let res: Response;
        if (this.agent) {
            const req = new UndiciRequest(url, { body: postData, method: options.method, headers: options.headers });
            res = await undiciFetch(req, { signal: controller.signal, dispatcher: this.agent });
        } else {
            const req = new Request(url, { body: postData, method: options.method, headers: options.headers });
            res = await fetch(req, { signal: controller.signal });
        }

        if (res.status === 401) {
            this.invalidateAuthorization();
            const authenticateHeader = res.headers.get('www-authenticate');
            if (
                authenticateHeader !== null &&
                authenticateHeader.indexOf('Digest') !== -1 &&
                wwwAuthenticateHeader === undefined
            ) {
                return this.sendRequestWithAuth(options, postData, authenticateHeader);
            } else {
                return res;
            }
        } else {
            return res;
        }
    }

    private static getURL(options: HttpRequestOptions) {
        const url = new URL(`${options.protocol}//${options.host}:${options.port}${options.path}`);
        return url.toString();
    }

    private getAuthorization(options: HttpRequestOptions, wwwAuthenticateHeader?: string) {
        if (options.user === undefined || options.pass === undefined) {
            this.authData = undefined;
            return;
        }

        if (
            this.authData &&
            (this.authData.host !== options.host ||
                this.authData.port !== options.port ||
                this.authData.user !== options.user ||
                this.authData.pass !== options.pass)
        ) {
            this.authData = undefined;
        }

        if (this.authData === undefined) {
            this.authData = {
                host: options.host,
                port: options.port,
                user: options.user!,
                pass: options.pass!,
                authHeader: this.getAuthHeader(options, wwwAuthenticateHeader),
            };
        }
        return this.authData;
    }

    private invalidateAuthorization() {
        this.authData = undefined;
    }

    private getAuthHeader(options: HttpRequestOptions, wwwAuthenticateHeader: string = '') {
        if (options.user === undefined || options.pass === undefined) {
            throw new Error('No credentials found');
        }

        if (wwwAuthenticateHeader.indexOf('Digest') !== -1) {
            return Digest.getAuthHeader(
                options.user,
                options.pass,
                options.method ?? 'GET',
                options.path,
                wwwAuthenticateHeader
            );
        } else {
            return `Basic ${btoa(options.user + ':' + options.pass)}`;
        }
    }
}
