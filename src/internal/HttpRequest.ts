import { Digest } from './Digest';

export type HttpRequestOptions = {
    method?: string;
    protocol: string;
    host: string;
    port: number;
    path: string;
    auth?: string;
    timeout?: number;
    headers?: Record<string, string>;
    rejectUnauthorized?: boolean;
};

function getURL(options: HttpRequestOptions) {
    const url = new URL(options.protocol + options.host);

    url.port = options.port.toString();
    url.pathname = options.path;

    if (options.auth !== undefined) {
        const [user, pass] = options.auth.split(':');
        url.username = user;
        url.password = pass;
    }

    return url.toString();
}

function getDigestHeader(options: HttpRequestOptions, digestHeader: string) {
    if (options.auth === undefined) {
        throw new Error('No credentials found');
    }
    const auth = options.auth.split(':');
    delete options.auth;

    options.method ??= 'GET';
    options.headers ??= {};

    return Digest.getAuthHeader(auth[0], auth[1], options.method, options.path, digestHeader);
}

async function sendRequestWithDigest(options: HttpRequestOptions, digestHeader: string, postData?: Buffer | string) {
    const url = getURL(options);
    options.headers ??= {};
    options.headers['Authorization'] = getDigestHeader(options, digestHeader);

    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);

    const req = new Request(url, { body: postData, method: options.method, headers: options.headers });
    const res = await fetch(req, { signal: controller.signal });
    return res;
}

export async function sendRequest(options: HttpRequestOptions, postData?: Buffer | string) {
    const url = getURL(options);

    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);

    const req = new Request(url, { body: postData, method: options.method, headers: options.headers });
    const res = await fetch(req, { signal: controller.signal });

    if (
        res.status === 401 &&
        res.headers.has('www-authenticate') &&
        res.headers.get('www-authenticate')!.indexOf('Digest') !== -1
    ) {
        return sendRequestWithDigest(options, res.headers.get('www-authenticate')!, postData);
    } else {
        return res;
    }
}
