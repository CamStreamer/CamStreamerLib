import * as http from 'http';
import * as https from 'https';
import { Digest } from './Digest';

type Resp = {
    resp: http.IncomingMessage;
    data?: string;
};

export type HttpRequestOptions = {
    method?: string;
    protocol?: string;
    host: string;
    port: number;
    path?: string;
    auth?: string;
    timeout?: number;
    headers?: {
        'Content-Type'?: string;
    };
};

export async function httpRequest(options: HttpRequestOptions, postData?: string, noWaitForData = false) {
    if (postData !== undefined) {
        options.headers ??= {};
        options.headers['Content-Type'] ??= 'application/x-www-form-urlencoded';
        options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    let response = await request(options, postData, undefined, noWaitForData);

    if (response.resp.statusCode == 200) {
        return noWaitForData ? response.resp : response.data;
    } else if (response.resp.statusCode == 401) {
        if (
            response.resp.headers['www-authenticate'] != undefined &&
            response.resp.headers['www-authenticate'].indexOf('Digest') != -1
        ) {
            response = await request(options, postData, response.resp.headers['www-authenticate'], noWaitForData);
            if (response.resp.statusCode == 200) {
                return noWaitForData ? response.resp : response.data;
            }
        }
    }
    if (noWaitForData) {
        throw new Error(`Error: status code: ${response.resp.statusCode}`);
    } else {
        throw new Error(`Error: status code: ${response.resp.statusCode}, ${response.data}`);
    }
}

function request(options: HttpRequestOptions, postData?: string, digestHeader?: string, noWaitForData?: boolean) {
    return new Promise<Resp>((resolve, reject) => {
        if (digestHeader != undefined) {
            if (options.auth == undefined) {
                reject('No credentials found');
            }
            const auth = options.auth.split(':');
            delete options.auth;

            options.method ??= 'GET';
            options.headers ??= {};

            options['headers']['Authorization'] = Digest.getAuthHeader(
                auth[0],
                auth[1],
                options.method,
                options.path,
                digestHeader
            );
        }

        let client = options.protocol === 'https:' ? https : http;
        let req = client
            .request(options, (resp) => {
                if (!noWaitForData) {
                    let data = '';
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    resp.on('end', () => {
                        resolve({ resp: resp, data: data });
                    });
                } else {
                    resolve({ resp: resp });
                }
            })
            .on('error', (err) => {
                reject(err);
            });

        if (postData != undefined) {
            req.write(postData);
        }
        req.end();
    });
}
