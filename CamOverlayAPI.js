const WebSocket = require('ws');
const EventEmitter = require('events');
const util = require('util');
const httpRequest = require('./HTTPRequest');
const Digest = require('./Digest');

function CamOverlayAPI(options) {
  this.protocol = 'ws';
  this.ip = '127.0.0.1';
  this.port = 80;
  this.auth = '';
  this.serviceName = '';
  this.serviceID = -1;
  this.camera = 0;
  if (options) {
    this.protocol = options['protocol'] || this.protocol;
    this.ip = options['ip'] || this.ip;
    this.port = options['port'];
    if (this.port == undefined) {
      this.port = this.protocol == 'ws' ? 80 : 443
    }
    this.auth = options['auth'] || this.auth;
    this.serviceName = options['serviceName'] || this.serviceName;
    this.serviceID = options['serviceID'] != undefined ? options['serviceID'] : this.serviceID; // If service is already created you can skip creation step by filling this parameter
    this.camera = options['camera'] != undefined ? options['camera'] : this.camera;
  }

  this.callId = 0;
  this.sendMessages = {};

  EventEmitter.call(this);
}

util.inherits(CamOverlayAPI, EventEmitter);

CamOverlayAPI.prototype.connect = function() {
  if (this.serviceID != -1) {
    return this.openWebsocket();
  } else {
    var promise = new Promise(function(resolve, reject) {
      this.createService().then(function(id) {
        this.serviceID = id;
        this.openWebsocket().then(resolve, reject);
      }.bind(this), function(err) {
        this.reportErr(err);
      }.bind(this));
    }.bind(this));
    return promise;
  }
}

CamOverlayAPI.prototype.createService = function() {
  var promise = new Promise(function(resolve, reject) {
    httpRequest({
      'host': this.ip,
      'port': this.port,
      'path': '/local/camoverlay/api/services.cgi?action=get',
      'auth': this.auth
    }).then(function(response) {
      let servicesJson;
      try {
        servicesJson = JSON.parse(response);
      }
      catch (err) {
        servicesJson = {'services':[]};
      }

      // Find service
      var service = null;
      var maxID = -1;
      if (servicesJson.hasOwnProperty('services')) {
        var servicesArr = servicesJson['services'];
        for (var i = 0; i < servicesArr.length; i++) {
          if (servicesArr[i].id > maxID) {
            maxID = servicesArr[i].id;
          }
          if (servicesArr[i].hasOwnProperty('identifier') && servicesArr[i].identifier == this.serviceName && servicesArr[i].name == 'scripter') {
            service = servicesArr[i];
            break;
          }
        }
      }
      if (service) {
        if (service.enabled == 1) {
          // Check and update service parameters if necessary
          if (service.camera == undefined || service.camera != this.camera) {
            service.camera = this.camera;
            this.updateServices(servicesJson).then(function() {
              resolve(service.id);
            }, reject);
          } else {
            resolve(service.id);
          }
        } else {
          reject('CamOverlay service is not enabled');
        }
      } else {  // Create new service
        var newServiceID = maxID + 1;
        servicesJson['services'].push({
          'id': newServiceID,
          'enabled': 1,
          'schedule': '',
          'name': 'scripter',
          'identifier': this.serviceName,
          'camera': this.camera
        });
        this.updateServices(servicesJson).then(function() {
          resolve(newServiceID);
        }, reject);
      }
    }.bind(this), reject);
  }.bind(this));
  return promise;
}

CamOverlayAPI.prototype.updateServices = function(servicesJson) {
  var promise = new Promise(function(resolve, reject) {
    httpRequest({
      'method':'POST',
      'host': this.ip,
      'port': this.port,
      'path': '/local/camoverlay/api/services.cgi?action=set',
      'auth': this.auth
    }, JSON.stringify(servicesJson)).then(function(response) {
      resolve();
    }, reject);
  }.bind(this));
  return promise;
}

CamOverlayAPI.prototype.openWebsocket = function(digestHeader) {
  var promise = new Promise(function(resolve, reject) {
    var userPass = this.auth.split(':');
    var addr = this.protocol + '://'  + this.ip + ':' + this.port + '/local/camoverlay/ws';
    var options = {};
    options.auth = this.auth;
    if (digestHeader != undefined) {
      options.headers = options.headers || {}
      options['headers']['Authorization'] = Digest.getAuthHeader(userPass[0], userPass[1], 'GET', '/local/camoverlay/ws', digestHeader);
    }
    this.ws = new WebSocket(addr, 'cairo-api', options);
    this.ws.on('open', function() {
      this.reportMsg('Websocket opened');
      resolve();
    }.bind(this));

    this.ws.on('message', function(data) {
      dataJSON = JSON.parse(data);
      if (dataJSON.hasOwnProperty('call_id') && dataJSON['call_id'] in this.sendMessages) {
        this.sendMessages[dataJSON['call_id']].resolve(dataJSON);
        delete this.sendMessages[dataJSON['call_id']];
      }

      if (dataJSON.hasOwnProperty('error')) {
        this.reportErr(JSON.stringify(data));
      } else {
        this.reportMsg(data);
      }
    }.bind(this));

    this.ws.on('unexpected-response', function(req, res) {
      if (res.statusCode == 401 && res.headers['www-authenticate'] != undefined)
        this.openWebsocket(res.headers['www-authenticate']).then(resolve, reject);
      else {
        reject('Error: status code: ' + res.statusCode + ', ' + res.data);
      }
    }.bind(this));

    this.ws.on('error', function(error) {
      this.reportErr(error);
      reject(error);
    }.bind(this));

    this.ws.on('close', function() {
      this.reportClose();
    }.bind(this));

  }.bind(this));
  return promise;
}

CamOverlayAPI.prototype.cairo = function(command, ...params) {
  return this.sendMessage({'command': command, 'params': params});
}

CamOverlayAPI.prototype.writeText = function(...params) {
  return this.sendMessage({'command': 'write_text', 'params': params});
}

CamOverlayAPI.prototype.uploadImageData = function(imgBuffer) {
  return this.sendMessage({'command': 'upload_image_data', 'params': [imgBuffer.toString('base64')]});
}

CamOverlayAPI.prototype.uploadFontData = function(fontBuffer) {
  return this.sendMessage({'command': 'upload_font_data', 'params': [fontBuffer.toString('base64')]});
}

CamOverlayAPI.prototype.showCairoImage = function(cairoImage, posX, posY) {
  return this.sendMessage({'command': 'show_cairo_image', 'params': [this.serviceID, cairoImage, posX, posY]});
}

CamOverlayAPI.prototype.removeImage = function() {
  return this.sendMessage({'command': 'remove_image', 'params': [this.serviceID]});
}

CamOverlayAPI.prototype.showCairoImageAbsolute = function(cairoImage, posX, posY, width, height) {
  return this.sendMessage({'command': 'show_cairo_image', 'params': [this.serviceID, cairoImage, -1.0 + (2.0 / width) * posX, -1.0 + (2.0 / height) * posY]});
}

CamOverlayAPI.prototype.sendMessage = function(msgJson) {
  var promise = new Promise(function(resolve, reject) {
    try {
      this.sendMessages[this.callId] = {'resolve': resolve, 'reject': reject};
      msgJson['call_id'] = this.callId++;
      this.ws.send(JSON.stringify(msgJson));
    } catch (err) {
      this.reportErr('Send message error: ' + err);
    }
  }.bind(this));
  return promise;
}

CamOverlayAPI.prototype.reportMsg = function(msg) {
  this.emit('msg', msg);
}

CamOverlayAPI.prototype.reportErr = function(err) {
  if (this.ws) {
    this.ws.terminate();
  }
  this.emit('error', err);
}

CamOverlayAPI.prototype.reportClose = function() {
  this.emit('close');
}

/*
 fields = [
    {
      field_name: name1
      text: text1
      [color: color1]
    },
    {
      ...
    }
  ]
*/
CamOverlayAPI.prototype.updateCGText = function(fields) {
  let cg_action = 'update_text';
  let field_specs = '';
  for(let i = 0; i < fields.length; i++){
    let f = fields[i];
    field_specs += '&';
    let name = f.field_name;
    field_specs += name + '=' + f.text;
    if ('color' in f){
      field_specs += '&' + name + '_color=' + f.color;
    }
  }
  return this.promiseCGUpdate(cg_action, field_specs);
}

/*
coorinates =
  left
  right
  top
  bottom
  top_left
  center
  ...
  ...
*/
CamOverlayAPI.prototype.updateCGImage = function(path, coordinates = '', x = 0, y = 0) {
  let cg_action = 'update_image';
  let coord = coordinates != "" ? '&coord_system=' + coordinates + '&pos_x=' + x + '&pos_y' + y : '';
  let update = '&image=' + path + coord;
  return this.promiseCGUpdate(cg_action, update);
}

CamOverlayAPI.prototype.promiseCGUpdate = function(action, params) {
  let pathofCG = '/local/camoverlay/api/customGraphics.cgi?';
  let promise = new Promise(function(resolve, reject) {
    httpRequest({
      'method': 'POST',
      'host': this.ip,
      'port': this.port,
      'path': encodeURI(pathofCG + 'action=' + action + '&service_id=' + this.serviceID + params),
      'auth': this.auth
    },'').then(function(response) {
      resolve();
    }, reject);
  }.bind(this));
  return promise;
}
module.exports = CamOverlayAPI;