import { Response as UndiciResponse } from 'undici';

export type Options = {
    ip?: string;
    port?: number;
    user?: string;
    pass?: string;
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
};

export type HttpOptions = Options & { keepAlive?: boolean };
export type WsOptions = Options;

export type TParameters = Record<string, string | number | boolean | null | undefined>;

export type TResponse = Response | UndiciResponse;

export type TGetParams = [url: string, parameters?: TParameters, headers?: Record<string, string>];

export type TPostParams = [
    url: string,
    data: string | Buffer | FormData,
    parameters?: TParameters,
    headers?: Record<string, string>
];

export interface IClient<TRes extends TResponse> {
    get: (...params: TGetParams) => Promise<TRes>;
    post: (...params: TPostParams) => Promise<TRes>;
}

// Blob response is different in browser and node.js, so we need to define it separately
export type TBlobResponse<Client extends IClient<TResponse>> = Awaited<
    ReturnType<Awaited<ReturnType<Client['get']>>['blob']>
>;

export interface IWebsocket<Event extends { readonly data: string }> {
    destroy: () => void;
    onmessage: null | ((event: Event) => void);
    send: (data: string) => void;
}
