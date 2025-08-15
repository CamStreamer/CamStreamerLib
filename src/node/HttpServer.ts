import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as EventEmitter from 'events';
import { Socket } from 'node:net';

export type HttpServerOptions = {
    host?: string;
    port?: number;
};

type TOnRequestCallback = (req: http.IncomingMessage, res: http.ServerResponse) => void;

export class HttpServer extends EventEmitter {
    private host: string;
    private port: number;
    private registeredPaths: Map<string, TOnRequestCallback>;
    private server: http.Server;
    private sockets: Record<number, Socket>;

    constructor(options?: HttpServerOptions) {
        super();
        this.host = options?.host ?? process.env.HTTP_HOST ?? '0.0.0.0';
        this.port = options?.port ?? parseInt(process.env.HTTP_PORT ?? '80');

        this.registeredPaths = new Map();
        this.server = http.createServer((req, res) => {
            this.emit('access', req.method + ' ' + req.url);

            // Parse URL
            const parsedUrl = url.parse(req.url ?? '');
            parsedUrl.pathname ??= '';

            // Find path in registered paths
            const requestCallback = this.registeredPaths.get(parsedUrl.pathname);
            if (requestCallback) {
                requestCallback(req, res);
                return;
            }
            // Extract URL path
            let pathname = `./html${parsedUrl.pathname}`;
            // Based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            // Maps file extention to MIME typere
            const map: Record<string, string> = {
                '.ico': 'image/x-icon',
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.wav': 'audio/wav',
                '.mp3': 'audio/mpeg',
                '.svg': 'image/svg+xml',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
            };

            fs.access(pathname, fs.constants.R_OK, (err) => {
                if (err) {
                    // If the file is not found, return 404
                    res.statusCode = 404;
                    res.end(`File ${pathname} not found!`);
                    this.emit('error', `File ${pathname} not found!`);
                    return;
                }

                // If is a directory search for index file matching the extension
                if (fs.statSync(pathname).isDirectory()) {
                    pathname += `/index${ext}`;
                }

                // Read file from file system
                fs.readFile(pathname, (error, data) => {
                    if (error) {
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${error}`);
                        this.emit('error', `Error getting the file: ${error}`);
                    } else {
                        // If the file is found, set Content-type and send data
                        res.setHeader('Content-type', map[ext] ?? 'text/plain');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.end(data);
                    }
                });
            });
        });

        this.server.on('error', (err) => {
            this.emit('error', err);
        });

        this.server.listen(this.port, this.host);
        this.sockets = {};
        let idTracker = 0;
        this.server.on('connection', (socket) => {
            const socketID = idTracker++;
            this.sockets[socketID] = socket;
            socket.on('close', () => {
                delete this.sockets[socketID];
            });
        });
    }

    getServer() {
        return this.server;
    }

    onRequest(pathName: string, callback: TOnRequestCallback) {
        this.registeredPaths.set(pathName, callback);
    }

    close() {
        this.server.close();
        for (const key in this.sockets) {
            this.sockets[key]?.destroy();
        }
    }
}
