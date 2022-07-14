const EventEmitter = require('eventemitter2');
const parseString = require('xml2js').parseString;
const prettifyXml = require('prettify-xml')

const RtspClient = require('./RtspClient');
const httpRequest = require('./HTTPRequest');

const WebSocket = require('ws');
const Digest = require('./Digest');


class CameraVapix extends EventEmitter {
    constructor(options) {
        super();
        this.protocol = 'http';
        this.ip = '127.0.0.1';
        this.port = 80;
        this.auth = '';

        if (options) {
            this.protocol = options['protocol'] || this.protocol;
            this.ip = options['ip'] || this.ip;
            this.port = options['port'];
            if (this.port == undefined) {
                this.port = this.protocol == 'http' ? 80 : 443
            }
            this.auth = options['auth'] || this.auth;
        }

        this.rtsp = null;
        this.ws = null;
    }

    getParameterGroup(groupNames) {
        let promise = new Promise((resolve, reject) => {
            this.vapixGet('/axis-cgi/param.cgi?action=list&group=' + encodeURIComponent(groupNames)).then((response) => {
                let params = {};
                let lines = response.split(/[\r\n]/);
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].length) {
                        let p = lines[i].split('=');
                        if (p.length >= 2) {
                            params[p[0]] = p[1];
                        }
                    }
                }
                resolve(params);
            }, reject);
        });
        return promise;
    }

    setParameter(params) {
        let postData = 'action=update&';
        Object.keys(params).forEach((key) => {
            postData += key + '=' + params[key] + '&';
        });
        postData = postData.slice(0, postData.length - 1);
        return this.vapixPost('/axis-cgi/param.cgi', postData);
    }

    getPTZPresetList(channel) {
        let promise = new Promise((resolve, reject) => {
            this.vapixGet('/axis-cgi/com/ptz.cgi?query=presetposcam&camera=' + encodeURIComponent(channel)).then((response) => {
                let positions = [];
                let lines = response.split(/[\r\n]/);
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].length && lines[i].indexOf('presetposno') != -1) {
                        let p = lines[i].split('=');
                        if (p.length >= 2) {
                            positions.push(p[1]);
                        }
                    }
                }
                resolve(positions);
            }, reject);
        });
        return promise;
    }

    goToPreset(channel, presetName) {
        return this.vapixPost('/axis-cgi/com/ptz.cgi', 'camera=' + encodeURIComponent(channel) + '&gotoserverpresetname=' + encodeURIComponent(presetName));
    }

    getGuardTourList() {
        let promise = new Promise((resolve, reject) => {
            let gTourList = [];
            this.getParameterGroup('GuardTour').then((response) => {
                for (let i = 0; i < 20; i++) {
                    let gTourBaseName = 'root.GuardTour.G' + i;
                    if (gTourBaseName + '.CamNbr' in response) {
                        let gTour = {
                            'ID': gTourBaseName,
                            'CamNbr': response[gTourBaseName + '.CamNbr'],
                            'Name': response[gTourBaseName + '.Name'],
                            'RandomEnabled': response[gTourBaseName + '.RandomEnabled'],
                            'Running': response[gTourBaseName + '.Running'],
                            'TimeBetweenSequences': response[gTourBaseName + '.TimeBetweenSequences'],
                            'Tour': []
                        };
                        for (let j = 0; j < 100; j++) {
                            let tourBaseName = 'root.GuardTour.G' + i + '.Tour.T' + j;
                            if (tourBaseName + '.MoveSpeed' in response) {
                                let tour = {
                                    'MoveSpeed': response[tourBaseName + '.MoveSpeed'],
                                    'Position': response[tourBaseName + '.Position'],
                                    'PresetNbr': response[tourBaseName + '.PresetNbr'],
                                    'WaitTime': response[tourBaseName + '.WaitTime'],
                                    'WaitTimeViewType': response[tourBaseName + '.WaitTimeViewType']
                                };
                                gTour.Tour.push(tour);
                            }
                        }
                        gTourList.push(gTour);
                    } else {
                        break;
                    }
                }
                resolve(gTourList);
            }, reject)
        });
        return promise;
    }

    setGuardTourEnabled(gourTourID, enable) {
        let options = {};
        options[gourTourID + '.Running'] = enable ? 'yes' : 'no';
        return this.setParameter(options);
    }

    getInputState(port) {
        let promise = new Promise((resolve, reject) => {
            this.vapixPost('/axis-cgi/io/port.cgi', 'checkactive=' + encodeURIComponent(port)).then((response) => {
                resolve(response.split('=')[1].indexOf('active') == 0);
            }, reject);
        });
        return promise;
    }

    setOutputState(port, active) {
        return this.vapixPost('/axis-cgi/io/port.cgi', 'action=' + encodeURIComponent(port) + ':' + (active ? '/' : '\\'));
    }

    getApplicationList() {
        const promise = new Promise((resolve, reject) => {
            this.vapixGet('/axis-cgi/applications/list.cgi').then((xml) => {
                parseString(xml, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    let apps = [];
                    for (let i = 0; i < result.reply.application.length; i++) {
                        apps.push(result.reply.application[i].$);
                    }
                    resolve(apps);
                });
            }, reject);
        });
        return promise;
    }

    getEventDeclarations() {
        const promise = new Promise((resolve, reject) => {
            let data =
                '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
                '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
                '</s:Body>' +
                '</s:Envelope>';
            this.vapixPost('/vapix/services', data, 'application/soap+xml').then((declarations) => {
                resolve(prettifyXml(declarations));
            }, reject);
        });
        return promise;
    }

    isReservedEventName(eventName) {
        return (eventName == 'eventsConnect' || eventName == 'eventsDisconnect');
    }

    eventsConnect(channel = "RTSP") {
        if (this.ws != null) {
            throw new Error("Websocket is already opened.");
        }
        if (this.rtsp != null) {
            throw new Error("RTSP is already opened.");
        }
        if (channel == "RTSP") {
            this.rtspConnect();
        }
        else if (channel == "websocket") {
            this.websocketConnect();
        }
        else {
            throw new Error("Unknown channel.");
        }
    }

    eventsDisconnect() {
        if (this.rtsp != null) {
            this.rtsp.disconnect();
        }
        if (this.ws != null) {
            this.ws.close();
        }
    }

    rtspConnect() {
        this.rtsp = new RtspClient({
            'ip': this.ip,
            'port': this.port,
            'auth': this.auth,
        });

        this.rtsp.on('connect', () => {
            this.emit('eventsConnect');
        });
        this.rtsp.on('disconnect', (err) => {
            this.emit('eventsDisconnect', err);
            this.rtsp = null;
        });
        this.rtsp.on('event', (event) => {
            let eventNames = this.eventNames();
            for (let i = 0; i < eventNames.length; i++) {
                if (!this.isReservedEventName(eventNames[i])) {
                    let name = eventNames[i];
                    // Remove special chars from the end
                    while (name[name.length - 1] == '.' || name[name.length - 1] == '/') {
                        name = name.substring(0, name.length - 1);
                    }
                    // Find registered event name in the message
                    if (event.indexOf(name) != -1) {
                        // Convert to JSON and emit signal
                        parseString(event, (err, eventJson) => {
                            if (err) {
                                this.eventsDisconnect();
                                return;
                            }
                            this.emit(eventNames[i], eventJson);
                        });
                        break;
                    }
                }
            }
        });

        let eventTopicFilter = '';
        let eventNames = this.eventNames();
        for (let i = 0; i < eventNames.length; i++) {
            if (!this.isReservedEventName(eventNames[i])) {
                if (eventTopicFilter.length != 0) {
                    eventTopicFilter += '|';
                }

                let topic = eventNames[i].replace(/tns1/g, 'onvif');
                topic = topic.replace(/tnsaxis/g, 'axis');
                eventTopicFilter += topic;
            }
        }
        this.rtsp.connect(eventTopicFilter);
    }

    websocketConnect(digestHeader) {
        const address = `ws://${this.ip}:${this.port}/vapix/ws-data-stream?sources=events`;

        let options =
        {
            'auth': this.auth
        };

        if (digestHeader !== undefined) {
            let userPass = this.auth.split(':');
            options.headers = options.headers || {};
            options['headers']['Authorization'] = Digest.getAuthHeader(userPass[0], userPass[1], 'GET', '/vapix/ws-data-stream?sources=events', digestHeader);
        }

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(address, options);

            this.ws.on('open', () => {
                let topics = [];
                let eventNames = this.eventNames();
                for (let i = 0; i < eventNames.length; i++) {
                    if (!this.isReservedEventName(eventNames[i])) {
                        let topic =
                        {
                            "topicFilter": eventNames[i]
                        }
                        topics.push(topic);
                    }
                }

                const topicFilter = {
                    "apiVersion": "1.0",
                    "method": "events:configure",
                    "params": {
                        "eventFilterList": topics
                    }
                }
                this.ws.send(JSON.stringify(topicFilter));
            });

            this.ws.on('unexpected-response', (req, res) => {
                if (res.statusCode == 401 && res.headers['www-authenticate'] != undefined)
                    this.websocketConnect(res.headers['www-authenticate']).then(resolve, reject);
                else {
                    reject('Error: status code: ' + res.statusCode + ', ' + res.data);
                }
            });

            this.ws.on('message', (data) => {
                let dataJSON = JSON.parse(data);
                if (dataJSON.method === 'events:configure') {
                    if (dataJSON.error === undefined) {
                        this.emit("eventsConnect");
                    }
                    else {
                        this.emit("eventsDisconnect", dataJSON.error);
                        this.eventsDisconnect();
                    }
                    return;
                }
                let eventName = dataJSON.params.notification.topic;
                this.emit(eventName, dataJSON);
            });
            this.ws.on('error', (error) => {
                this.emit("eventsDisconnect", error);
                this.ws = null;
            });
            this.ws.on('close', () => {
                if (this.ws !== null) {
                    this.emit("websocketDisconnect");
                }
                this.ws = null;
            });
        });
    }

    vapixGet(path, noWaitForData) {
        let options = this.getBaseVapixConnectionParams();
        options['path'] = encodeURI(path);
        return httpRequest(options, undefined, noWaitForData);
    }

    async getCameraImage(camera, compression, resolution, outputStream) {
        const path = `/axis-cgi/jpg/image.cgi?resolution=${resolution}&compression=${compression}&camera=${camera}`;
        const res = await this.vapixGet(path, true);
        res.pipe(outputStream);
        return outputStream;
    }

    vapixPost(path, data, contentType) {
        let options = this.getBaseVapixConnectionParams();
        options['method'] = 'POST';
        options['path'] = path;
        if (contentType) {
            options['headers'] = { 'Content-Type': contentType };
        }
        return httpRequest(options, data);
    }

    getBaseVapixConnectionParams(options, postData) {
        return {
            'protocol': this.protocol + ':',
            'host': this.ip,
            'port': this.port,
            'auth': this.auth
        };
    }
}
module.exports = CameraVapix;