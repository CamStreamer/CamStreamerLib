import * as http from 'http';
import { AddressInfo } from 'net';
import { FormData } from 'undici';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

import { HttpRequestOptions, HttpRequestSender } from './HttpRequestSender';

type TReceivedRequest = {
    method?: string;
    url?: string;
    authorization?: string;
    contentType?: string;
    body: string;
};

type THandler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

const DIGEST_CHALLENGE = 'Digest realm="test", qop="auth", nonce="abc123", opaque="xyz"';

const okHandler: THandler = (_req, res) => {
    res.end('ok');
};

const digestHandler: THandler = (req, res) => {
    if (req.headers.authorization?.startsWith('Digest ') !== true) {
        res.writeHead(401, { 'WWW-Authenticate': DIGEST_CHALLENGE });
        res.end();
        return;
    }
    res.end('ok');
};

describe('HttpRequestSender', () => {
    let server: http.Server;
    let received: TReceivedRequest[];
    let handler: THandler;

    const options = (overrides: Partial<HttpRequestOptions> = {}): HttpRequestOptions => ({
        protocol: 'http:',
        host: '127.0.0.1',
        port: (server.address() as AddressInfo).port,
        path: '/test.cgi',
        user: 'root',
        pass: 'pass',
        ...overrides,
    });

    beforeEach(async () => {
        received = [];
        handler = okHandler;
        server = http.createServer((req, res) => {
            let body = '';
            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                received.push({
                    method: req.method,
                    url: req.url,
                    authorization: req.headers.authorization,
                    contentType: req.headers['content-type'],
                    body,
                });
                handler(req, res);
            });
        });
        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', resolve);
        });
    });

    afterEach(async () => {
        server.closeAllConnections();
        await new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
    });

    test('sends basic auth when the server accepts it', async () => {
        const res = await new HttpRequestSender().sendRequest(options());

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('ok');
        expect(received).toHaveLength(1);
        expect(received[0]?.authorization).toBe(`Basic ${Buffer.from('root:pass').toString('base64')}`);
    });

    test('sends no authorization without credentials', async () => {
        await new HttpRequestSender().sendRequest(options({ user: undefined, pass: undefined }));

        expect(received[0]?.authorization).toBeUndefined();
    });

    test('retries with digest auth on a digest 401 and reuses it for later requests', async () => {
        handler = digestHandler;
        const sender = new HttpRequestSender();

        const first = await sender.sendRequest(options());
        const second = await sender.sendRequest(options());

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(received.map((r) => r.authorization?.split(' ')[0])).toEqual(['Basic', 'Digest', 'Digest']);
    });

    test('retries a digest 401 only once', async () => {
        handler = (_req, res) => {
            res.writeHead(401, { 'WWW-Authenticate': DIGEST_CHALLENGE });
            res.end();
        };

        const res = await new HttpRequestSender().sendRequest(options());

        expect(res.status).toBe(401);
        expect(received).toHaveLength(2);
    });

    test('rejects when the response does not arrive within the timeout', async () => {
        handler = () => undefined;

        await expect(new HttpRequestSender().sendRequest(options({ timeout: 200 }))).rejects.toThrow();
    });

    test('sends a url-encoded POST body', async () => {
        const res = await new HttpRequestSender().sendRequest(
            options({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
            'action=settext&text=hello'
        );

        expect(res.ok).toBe(true);
        expect(received[0]).toMatchObject({
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            body: 'action=settext&text=hello',
        });
    });

    test('sends a JSON POST body', async () => {
        const payload = JSON.stringify({ text: 'hello', index: 1 });

        await new HttpRequestSender().sendRequest(
            options({ method: 'POST', headers: { 'Content-Type': 'application/json' } }),
            payload
        );

        expect(received[0]).toMatchObject({ method: 'POST', contentType: 'application/json', body: payload });
    });

    test('sends a Buffer POST body', async () => {
        await new HttpRequestSender().sendRequest(options({ method: 'POST' }), Buffer.from('binary-data'));

        expect(received[0]?.body).toBe('binary-data');
    });

    test('sends a FormData POST body as multipart', async () => {
        const formData = new FormData();
        formData.append('field', 'value');

        await new HttpRequestSender().sendRequest(options({ method: 'POST' }), formData);

        expect(received[0]?.contentType).toMatch(/^multipart\/form-data; boundary=/);
        expect(received[0]?.body).toContain('value');
    });

    test('resends the POST body on the digest retry', async () => {
        handler = digestHandler;

        await new HttpRequestSender().sendRequest(options({ method: 'POST' }), 'payload');

        expect(received.map((r) => r.body)).toEqual(['payload', 'payload']);
    });
});
