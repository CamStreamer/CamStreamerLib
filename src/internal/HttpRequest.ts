import { Digest } from './Digest';

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
    rejectUnauthorized?: boolean;
};

function getURL(options: HttpRequestOptions) {
    const url = new URL(options.protocol + options.host + options.path);
    url.port = options.port.toString();
    return url.toString();
}

function getDigestHeader(options: HttpRequestOptions, digestHeader: string) {
    if (options.user === undefined || options.pass === undefined) {
        throw new Error('No credentials found');
    }

    options.method ??= 'GET';
    options.headers ??= {};

    return Digest.getAuthHeader(options.user, options.pass, options.method, options.path, digestHeader);
}

async function sendRequestWithDigest(
    options: HttpRequestOptions,
    digestHeader: string,
    postData?: Buffer | string | FormData
) {
    const url = getURL(options);
    options.headers ??= {};
    options.headers['Authorization'] = getDigestHeader(options, digestHeader);

    const controller = new AbortController();
    if (options.timeout !== undefined) {
        setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);
    }

    const req = new Request(url, { body: postData, method: options.method, headers: options.headers });
    const res = await fetch(req, { signal: controller.signal });
    return res;
}

export async function sendRequest(options: HttpRequestOptions, postData?: Buffer | string | FormData) {
    const url = getURL(options);
    const controller = new AbortController();
    if (options.timeout !== undefined) {
        setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);
    }

    if (options.user !== undefined && options.pass !== undefined) {
        options.headers ??= {};
        options.headers['Authorization'] = `Basic ${btoa(options.user + ':' + options.pass)}`;
    }

    const myFetch = options.rejectUnauthorized ? fetch : (await import('./fetchInsecure')).fetchInsecure;

    const req = new Request(url, { body: postData, method: options.method, headers: options.headers });
    const res = await myFetch(req, { signal: controller.signal });

    const wwwAuthenticateHeader = res.headers.get('www-authenticate');
    if (res.status === 401 && wwwAuthenticateHeader !== null && wwwAuthenticateHeader.indexOf('Digest') !== -1) {
        return sendRequestWithDigest(options, wwwAuthenticateHeader, postData);
    } else {
        return res;
    }
}
