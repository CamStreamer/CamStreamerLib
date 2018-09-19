const util = require('util');

const httpRequest = require('./HTTPRequest');

function CamSwitcherAPI(options) {
  this.ip = '127.0.0.1';
  this.port = 80;
  this.auth = '';
  if (options) {
    this.ip = options['ip'] || this.ip;
    this.port = options['port'] || 80;
    this.auth = options['auth'] || this.auth;
  }
}

CamSwitcherAPI.prototype.getSourceList = function(outputName) {
  outputName = outputName || 'output0';
  var promise = new Promise(function(resolve, reject) {
    var options = this.getBaseConnectionParams();
    options['path'] = '/axis-cgi/param.cgi?action=list&group=camswitcher.outputs';
    httpRequest(options).then(function(response) {
      var lines = response.split(/[\r\n]/);
      if (lines.length) {
        var index = lines[0].indexOf('=');
        if (index != -1) {
          response = lines[0].substring(index + 1);
        }
      }
      try {
        response = JSON.parse(response);
        var output = response.outputs[outputName];
        if (output) {
          resolve(output.sources);
        } else {
          reject('Unknown error');
        }
      } catch(err) {
        reject(err);
      }
    }, reject);
  }.bind(this));
  return promise;
}

CamSwitcherAPI.prototype.getClipList = function() {
  return this.get('/local/camswitcher/api/clip_list.cgi');
}

CamSwitcherAPI.prototype.liveSourceSwitch = function(sourceName, outputName) {
  outputName = outputName || 'output0';
  return this.get('/local/camswitcher/live_source_switch.cgi?output_name=' + outputName + '&source_name=' + sourceName);
}

CamSwitcherAPI.prototype.clipQueueList = function(outputName) {
  outputName = outputName || 'output0';
  return this.get('/local/camswitcher/clip_queue_list.cgi?output_name=' + outputName);
}

CamSwitcherAPI.prototype.clipQueuePush = function(clipName, outputName, loop) {
  outputName = outputName || 'output0';
  loop = loop || 1;
  return this.get('/local/camswitcher/clip_queue_push.cgi?output_name=' + outputName + '&clip_name=' + clipName + '&loop=' + loop);
}

CamSwitcherAPI.prototype.clipQueueClear = function(outputName) {
  outputName = outputName || 'output0';
  return this.get('/local/camswitcher/clip_queue_clear.cgi?output_name=' + outputName);
}

CamSwitcherAPI.prototype.clipQueuePlay = function(outputName) {
  outputName = outputName || 'output0';
  return this.get('/local/camswitcher/clip_queue_play.cgi?output_name=' + outputName);
}

CamSwitcherAPI.prototype.clipQueueStop = function(outputName) {
  outputName = outputName || 'output0';
  return this.get('/local/camswitcher/clip_queue_stop.cgi?output_name=' + outputName);
}

CamSwitcherAPI.prototype.get = function(path) {
  var promise = new Promise(function(resolve, reject) {
    var options = this.getBaseConnectionParams();
    options['path'] = encodeURI(path);
    httpRequest(options).then(function(data) {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err + 'msg: ' + data);
      }
    }, reject);
  }.bind(this));
  return promise;
}

CamSwitcherAPI.prototype.getBaseConnectionParams = function(options, postData) {
  return {
    'protocol': 'http:',
    'host': this.ip,
    'port': this.port,
    'auth': this.auth
  };
}

module.exports = CamSwitcherAPI;