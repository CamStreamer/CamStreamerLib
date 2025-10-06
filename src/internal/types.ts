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
export type TResponse = {
    json: () => Promise<any>;
    text: () => Promise<string>;
    blob: () => Promise<unknown>;
    status: number;
    ok: boolean;
};

export type TGetParams = {
    path: string;
    parameters?: TParameters;
    headers?: Record<string, string>;
    timeout?: number;
};

export type TPostParams<Data> = {
    path: string;
    data: string | Data;
    parameters?: TParameters;
    headers?: Record<string, string>;
    timeout?: number;
};

export interface IClient<TRes extends TResponse, Data> {
    get: (params: TGetParams) => Promise<TRes>;
    post: (params: TPostParams<Data>) => Promise<TRes>;
}

// Blob response is different in browser and node.js, so we need to define it separately
export type TBlobResponse<Client extends IClient<TResponse, any>> = Awaited<
    ReturnType<Awaited<ReturnType<Client['get']>>['blob']>
>;

export interface IWebsocket<Event extends { readonly data: string }> {
    destroy: () => void;
    onmessage: null | ((event: Event) => void);
    send: (data: string) => void;
}
