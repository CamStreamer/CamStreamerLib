const util = require('util');

const httpRequest = require('./HTTPRequest');

function CamStreamerAPI(options) {
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
}

CamStreamerAPI.prototype.getStreamList = function() {
  var promise = new Promise(function(resolve, reject) {
    this.get('/local/camstreamer/stream/list.cgi').then(function(streamListRes) {
      resolve(streamListRes.data);
    }, reject);
  }.bind(this));
  return promise;
}

CamStreamerAPI.prototype.getStreamParameter = function(streamID, paramName) {
  var promise = new Promise(function(resolve, reject) {
    this.get('/local/camstreamer/stream/get.cgi?stream_id=' + streamID).then(function(stream) {
      resolve(stream.data[paramName]);
    }, reject);
  }.bind(this));
  return promise;
}

CamStreamerAPI.prototype.setStreamParameter = function(streamID, paramName, value) {
  var promise = new Promise(function(resolve, reject) {
    this.get('/local/camstreamer/stream/set.cgi?stream_id=' + streamID + '&' + paramName + '=' + value).then(function(response) {
      resolve(response);
    }, reject);
  }.bind(this));
  return promise;
}

CamStreamerAPI.prototype.isStreaming = function(streamID) {
  var promise = new Promise(function(resolve, reject) {
    this.get('/local/camstreamer/get_streamstat.cgi?stream_id=' + streamID).then(function(response) {
      resolve(response.data.is_streaming);
    }, reject);
  }.bind(this));
  return promise;
}

CamStreamerAPI.prototype.get = function(path) {
  var promise = new Promise(function(resolve, reject) {
    var options = this.getBaseConnectionParams();
    options['path'] = encodeURI(path);
    httpRequest(options).then(function(data) {
      resolve(JSON.parse(data));
    }, reject);
  }.bind(this));
  return promise;
}

CamStreamerAPI.prototype.getBaseConnectionParams = function(options, postData) {
  return {
    'protocol': this.protocol + ':',
    'host': this.ip,
    'port': this.port,
    'auth': this.auth
  };
}

module.exports = CamStreamerAPI;