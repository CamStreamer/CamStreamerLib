import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as EventEmitter from 'events';
import { Socket } from 'node:net';

export type HttpServerOptions = {
    port?: number;
};

type OnRequestCallback = (req: http.IncomingMessage, res: http.ServerResponse) => void;

export class HttpServer extends EventEmitter {
    private port: number;
    private registeredPaths: Map<string, OnRequestCallback>;
    private server: http.Server;
    private sockets: Record<number, Socket>;

    constructor(options?: HttpServerOptions) {
        super();
        this.port = options?.port ?? parseInt(process.env.HTTP_PORT);

        this.registeredPaths = new Map();
        this.server = http.createServer((req, res) => {
            this.emit('access', req.method + ' ' + req.url);

            // Parse URL
            const parsedUrl = url.parse(req.url);
            // Find path in registered paths
            if (this.registeredPaths.has(parsedUrl.pathname)) {
                this.registeredPaths.get(parsedUrl.pathname)(req, res);
                return;
            }
            // Extract URL path
            let pathname = `./html${parsedUrl.pathname}`;
            // Based on the URL path, extract the file extention. e.g. .js, .doc, ...
            const ext = path.parse(pathname).ext;
            // Maps file extention to MIME typere
            const map = {
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
                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(`Error getting the file: ${err}`);
                        this.emit('error', `Error getting the file: ${err}`);
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

        this.server.listen(this.port);
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

    onRequest(path: string, callback: OnRequestCallback) {
        this.registeredPaths.set(path, callback);
    }

    close() {
        this.server.close();
        for (const key in this.sockets) {
            this.sockets[key].destroy();
        }
    }
}
