export type TProxyParam = {
    ip: string;
    mdnsName: string;
    port: number;
    user: string;
    pass: string;
} | null;

export type TFetchFunction = (
    proxy: TProxyParam,
    url: string,
    parameters: Record<string, string | number>,
    headers?: Record<string, string>
) => Promise<string>;

export interface IProxyClient {
    fetchGet: TFetchFunction;
    fetchPostJson: TFetchFunction;
    fetchPostUrlEncoded: TFetchFunction;
    nodeFetchPostFormData: (
        proxy: TProxyParam,
        url: string,
        data: FormData,
        headers?: Record<string, string>
    ) => Promise<Response>;
}
