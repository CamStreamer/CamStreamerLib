const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const util = require('util');

export class HttpServer extends EventEmitter {
    constructor(options) {
        super();
        this.port = process.env.HTTP_PORT;
        if (options) {
            this.port = options['port'] || process.env.HTTP_PORT;
        }
        this.registeredPaths = {};
        this.server = http.createServer((req, res) => {
            this.emit('access', req.method + ' ' + req.url);

            // Parse URL
            const parsedUrl = url.parse(req.url);
            // Find path in registered paths
            if (parsedUrl.pathname in this.registeredPaths) {
                this.registeredPaths[parsedUrl.pathname](req, res);
                return;
            }
            // Extract URL path
            let pathname = './html' + parsedUrl.pathname;
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
                '.doc': 'application/msword'
            };

            fs.exists(pathname, (exist) => {
                if (!exist) {
                    // If the file is not found, return 404
                    res.statusCode = 404;
                    res.end('File ' + pathname + ' not found!');
                    this.emit('error', 'File ' + pathname + ' not found!');
                    return;
                }

                // If is a directory search for index file matching the extension
                if (fs.statSync(pathname).isDirectory())
                    pathname += '/index' + ext;

                // Read file from file system
                fs.readFile(pathname, (err, data) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Error getting the file: ' + err);
                        this.emit('error', 'Error getting the file: ' + err);
                    } else {
                        // If the file is found, set Content-type and send data
                        res.setHeader('Content-type', map[ext] || 'text/plain');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.end(data);
                    }
                });
            });
        });

        this.server.on('error', function (err) {
            this.emit('error', err);
        });

        this.server.listen(parseInt(this.port));
        this.sockets = {};
        let idTracker = 0
        this.server.on('connection', (socket) => {
            let socketID = idTracker++;
            this.sockets[socketID] = socket
            socket.on('close', () => {
                delete this.sockets[socketID];
            });
        })
    }

    onRequest(path, callback) {
        this.registeredPaths[path] = callback;
    }

    close() {
        this.server.close();
        for (let socketID in this.sockets) {
            this.sockets[socketID].destroy();
        }
    }
}