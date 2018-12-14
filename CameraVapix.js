const util = require('util');
const EventEmitter = require('eventemitter2');
const parseString = require('xml2js').parseString;
const prettifyXml = require('prettify-xml')

const RtspClient = require('./RtspClient');
const httpRequest = require('./HTTPRequest');

function CameraVapix(options) {
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

  EventEmitter.call(this);
}

util.inherits(CameraVapix, EventEmitter);

CameraVapix.prototype.getParameterGroup = function(groupNames) {
  var promise = new Promise(function(resolve, reject) {
    this.vapixGet('/axis-cgi/param.cgi?action=list&group=' + encodeURIComponent(groupNames)).then(function(response) {
      var params = {};
      var lines = response.split(/[\r\n]/);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length) {
          var p = lines[i].split('=');
          if (p.length >= 2) {
            params[p[0]] = p[1];
          }
        }
      }
      resolve(params);
    }, reject);
  }.bind(this));
  return promise;
}

CameraVapix.prototype.setParameter = function(params) {
  var postData = 'action=update&';
  Object.keys(params).forEach(function(key) {
    postData += key + '=' + params[key] + '&';
  });
  postData = postData.slice(0, postData.length - 1);
  return this.vapixPost('/axis-cgi/param.cgi', postData);
}

CameraVapix.prototype.getPTZPresetList = function(channel) {
  var promise = new Promise(function(resolve, reject) {
    this.vapixGet('/axis-cgi/com/ptz.cgi?query=presetposcam&camera=' + encodeURIComponent(channel)).then(function(response) {
      var positions = [];
      var lines = response.split(/[\r\n]/);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length && lines[i].indexOf('presetposno') != -1) {
          var p = lines[i].split('=');
          if (p.length >= 2) {
            positions.push(p[1]);
          }
        }
      }
      resolve(positions);
    }, reject);
  }.bind(this));
  return promise;
}

CameraVapix.prototype.goToPreset = function(channel, presetName) {
  return this.vapixPost('/axis-cgi/com/ptz.cgi', 'camera=' + encodeURIComponent(channel) + '&gotoserverpresetname=' + encodeURIComponent(presetName));
}

CameraVapix.prototype.getGuardTourList = function() {
  var promise = new Promise(function(resolve, reject) {
    var gTourList = [];
    this.getParameterGroup('GuardTour').then(function(response) {
      for (var i = 0; i < 20; i++) {
        var gTourBaseName = 'root.GuardTour.G' + i;
        if (gTourBaseName + '.CamNbr' in response) {
          var gTour = {
            'ID': gTourBaseName,
            'CamNbr': response[gTourBaseName + '.CamNbr'],
            'Name': response[gTourBaseName + '.Name'],
            'RandomEnabled': response[gTourBaseName + '.RandomEnabled'],
            'Running': response[gTourBaseName + '.Running'],
            'TimeBetweenSequences': response[gTourBaseName + '.TimeBetweenSequences'],
            'Tour': []
          };
          for (var j = 0; j < 100; j++) {
            var tourBaseName = 'root.GuardTour.G' + i + '.Tour.T' + j;
            if (tourBaseName + '.MoveSpeed' in response) {
              var tour = {
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
  }.bind(this));
  return promise;
}

CameraVapix.prototype.setGuardTourEnabled = function(gourTourID, enable) {
  var options = {};
  options[gourTourID + '.Running'] = enable ? 'yes' : 'no';
  return this.setParameter(options);
}

CameraVapix.prototype.getInputState = function(port) {
  var promise = new Promise(function(resolve, reject) {
    this.vapixPost('/axis-cgi/io/port.cgi', 'checkactive=' + encodeURIComponent(port)).then(function(response) {
      resolve(response.split('=')[1].indexOf('active') == 0);
    }, reject);
  }.bind(this));
  return promise;
}

CameraVapix.prototype.setOutputState = function(port, active) {
  return this.vapixPost('/axis-cgi/io/port.cgi', 'action=' + encodeURIComponent(port) + ':' + (active ? '/' : '\\'));
}

CameraVapix.prototype.getApplicationList = function() {
  var promise = new Promise(function(resolve, reject) {
    this.vapixGet('/axis-cgi/applications/list.cgi').then(function(xml) {
      parseString(xml, function (err, result) {
        if (err) {
          reject(err);
          return;
        }
        var apps = [];
        for (var i = 0; i < result.reply.application.length; i++) {
          apps.push(result.reply.application[i].$);
        }
        resolve(apps);
      });
    }, reject);
  }.bind(this));
  return promise;
}

CameraVapix.prototype.getEventDeclarations = function() {
  var promise = new Promise(function(resolve, reject) {
    var data =
    '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
      '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        '<GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/>' +
      '</s:Body>' +
    '</s:Envelope>';
    this.vapixPost('/vapix/services', data, 'application/soap+xml').then(function(declarations) {
      resolve(prettifyXml(declarations));
    }, reject);
  }.bind(this));
  return promise;
}

CameraVapix.prototype.eventsConnect = function() {
  this.rtsp = new RtspClient({
    'ip': this.ip,
    'port': this.port,
    'auth': this.auth,
  });

  this.rtsp.on('connect', function() { this.emit('eventsConnect'); }.bind(this));
  this.rtsp.on('disconnect', function(err) { this.emit('eventsDisconnect', err); }.bind(this));
  this.rtsp.on('event', function(event) {
    var eventNames = this.eventNames();
    for (var i = 0; i < eventNames.length; i++) {
      if (eventNames[i] != 'eventsConnect' && eventNames[i] != 'eventsDisconnect') {
        var name = eventNames[i];
        // Remove special chars from the end
        while (name[name.length - 1] == '.' || name[name.length - 1] == '/') {
          name = name.substring(0, name.length - 1);
        }
        // Find registered event name in the message
        if (event.indexOf(name) != -1) {
          // Convert to JSON and emit signal
          parseString(event, function (err, eventJson) {
            if (err) {
              this.eventsDisconnect();
              return;
            }
            this.emit(eventNames[i], eventJson);
          }.bind(this));
          break;
        }
      }
    }
  }.bind(this));

  var eventTopicFilter = '';
  var eventNames = this.eventNames();
  for (var i = 0; i < eventNames.length; i++) {
    if (eventNames[i] != 'eventsConnect' && eventNames[i] != 'eventsDisconnect') {
      if (eventTopicFilter.length != 0) {
        eventTopicFilter += '|';
      }

      var topic = eventNames[i].replace(/tns1/g, 'onvif');
      topic = topic.replace(/tnsaxis/g, 'axis');
      eventTopicFilter += topic;
    }
  }
  this.rtsp.connect(eventTopicFilter);
}

CameraVapix.prototype.eventsDisconnect = function() {
  if (this.rtsp) {
    this.rtsp.disconnect();
    this.rtsp = null;
  }
}

CameraVapix.prototype.vapixGet = function(path) {
  var options = this.getBaseVapixConnectionParams();
  options['path'] = encodeURI(path);
  return httpRequest(options);
}

CameraVapix.prototype.vapixPost = function(path, data, contentType) {
  var options = this.getBaseVapixConnectionParams();
  options['method'] = 'POST';
  options['path'] = path;
  if (contentType) {
    options['headers'] = {'Content-Type': contentType};
  }
  return httpRequest(options, data);
}

CameraVapix.prototype.getBaseVapixConnectionParams = function(options, postData) {
  return {
    'protocol': this.protocol + ':',
    'host': this.ip,
    'port': this.port,
    'auth': this.auth
  };
}

module.exports = CameraVapix;