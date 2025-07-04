type Options = {
    ip?: string;
    port?: number;
    user?: string;
    pass?: string;
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
};

export type HttpOptions = Options & { keepAlive?: boolean };
export type WsOptions = Options;

export type TResponse = {
    ok: boolean;
    json: () => Promise<any>;
    text: () => Promise<string>;
    status: number;
    body: any | null;
};
export type TParameters = Record<string, string | number | boolean | null | undefined>;

export type TGetFunction = (
    url: string,
    parameters?: TParameters,
    headers?: Record<string, string>
) => Promise<TResponse>;

export type TPostFunction = (
    url: string,
    data: string | Buffer | FormData,
    parameters?: TParameters,
    headers?: Record<string, string>
) => Promise<TResponse>;

export interface IClient {
    get: TGetFunction;
    post: TPostFunction;
}

export interface IWebsocket<Event extends { readonly data: string }> {
    destroy: () => void;
    onmessage: null | ((event: Event) => void);
    send: (data: string) => void;
}

export function isClient(arg: Options | IClient = {}): arg is IClient {
    return 'get' in arg && 'post' in arg;
}

export function isBrowserEnvironment() {
    return typeof process === 'undefined' || !process.versions.node;
}

export async function responseStringify(res: TResponse): Promise<string> {
    return JSON.stringify({
        status: res.status,
        body: await res.text(),
    });
}

export function pad(num: number, size: number) {
    const sign = Math.sign(num) === -1 ? '-' : '';
    return (
        sign +
        new Array(size)
            .concat([Math.abs(num)])
            .join('0')
            .slice(-size)
    );
}

export function isNullish<T>(value: T | undefined | null): value is undefined | null {
    return value === null || value === undefined;
}
