import { Digest } from './Digest';

export class ErrorStatusCode {
    constructor(public code: number, public body: Response) {}
}
export type HttpRequestOptions = {
    method?: string;
    protocol?: string;
    host: string;
    port: number;
    path?: string;
    auth?: string;
    timeout?: number;
    headers?: any;
    rejectUnauthorized?: boolean;
};

function getURL(options: HttpRequestOptions) {
    let url = new URL(options.protocol + options.host);

    if (options.port) {
        url.port = options.port.toString();
    }
    if (options.path) {
        url.pathname = options.path;
    }

    return url.toString();
}
function getDigestHeader(options: HttpRequestOptions, digestHeader: string) {
    if (options.auth == undefined) {
        throw new Error('No credentials found');
    }
    const auth = options.auth.split(':');
    delete options.auth;

    options.method ??= 'GET';
    options.headers ??= {};

    return Digest.getAuthHeader(auth[0], auth[1], options.method, options.path, digestHeader);
}

export async function sendRequest(options: HttpRequestOptions, postData?: Buffer | string, digestHeader?: string) {
    const url = getURL(options);
    if (digestHeader) {
        options['headers']['Authorization'] = getDigestHeader(options, digestHeader);
    }

    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('Request timeout')), options.timeout);

    let req = new Request(url, { body: postData });
    let res = await fetch(req, { signal: controller.signal });

    if (res.ok) {
        return res;
    } else if (res.status == 401) {
        if (res.headers['www-authenticate'] != undefined && res.headers['www-authenticate'].indexOf('Digest') != -1) {
            res = await sendRequest(options, postData, res.headers['www-authenticate']);
            if (res.ok) {
                return res;
            }
        }
    }

    throw new ErrorStatusCode(res.status, res);
}
export async function getResponse(options: HttpRequestOptions, postData?: Buffer | string, digestHeader?: string) {
    let res = await sendRequest(options, postData, digestHeader);
    return res.text();
}
