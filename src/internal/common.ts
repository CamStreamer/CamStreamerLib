export type Options = {
    ip?: string;
    port?: number;
    user?: string;
    pass?: string;
    tls?: boolean;
    tlsInsecure?: boolean; // Ignore HTTPS certificate validation (insecure)
};

export type TGetFunction = (
    url: string,
    parameters?: Record<string, string>,
    headers?: Record<string, string>
) => Promise<Response>;
export type TPostFunction = (
    url: string,
    data: string | Buffer,
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
