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

export type TNetworkCameraList = {
    name: string;
    ip: string;
}[];

export type TKeyboardShortcut = string | null;
export type TKeyboardShortcuts = Record<string, TKeyboardShortcut>;

export type TGetFunction = (
    url: string,
    parameters?: Record<string, string>,
    headers?: Record<string, string>
) => Promise<Response>;

export type TPostFunction = (
    url: string,
    data: string | Buffer | FormData,
    parameters?: Record<string, string>,
    headers?: Record<string, string>
) => Promise<Response>;

export interface IClient {
    get: TGetFunction;
    post: TPostFunction;
}

export function isClient(arg: Options | IClient = {}): arg is IClient {
    return 'get' in arg && 'post' in arg;
}

export function isBrowserEnvironment() {
    return typeof process === 'undefined' || process.versions === null || process.versions.node === null;
}

export async function responseStringify(res: Response): Promise<string> {
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
