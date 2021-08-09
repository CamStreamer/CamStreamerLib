const util = require('util');
const WebSocket = require('ws')
const EventEmitter = require('eventemitter2');

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

  EventEmitter.call(this);
}

util.inherits(CamSwitcherAPI, EventEmitter);

// Connect for Websocket events
CamSwitcherAPI.prototype.connect = async function() {
  try {
    let token = await this.get('/local/camswitcher/ws_authorization.cgi');
    this.ws = new WebSocket('ws://' + this.ip + ':' + this.port + '/local/camswitcher/events', 'events');
    this.pingTimer = null;

    this.ws.on('open', () => {
      this.ws.send(JSON.stringify({'authorization': token}));
      this.ws.isAlive = true;
      this.pingTimer = setInterval(() => {
        if (this.ws.isAlive === false) {
          return this.ws.terminate();
        }
        this.ws.isAlive = false;
        this.ws.ping();
      }, 30000);
    });

    this.ws.on('pong', () => {
      this.ws.isAlive = true;
    });

    this.ws.on('message', (data) => {
      try {
        data = JSON.parse(data);
        this.emit('event', data);
      } catch(err) {
        console.log(err);
      }
    });

    this.ws.on('close', () => {
      clearInterval(this.pingTimer);
      this.emit('event_connection_close');
    });

    this.ws.on('error', (err) => {
      this.emit('event_connection_error', err);
    });
  } catch (err) {
    this.emit('event_connection_error', err);
  }
}

CamSwitcherAPI.prototype.getPlaylistList = function() {
  return this.get('/local/camswitcher/playlists.cgi?action=get');
}

CamSwitcherAPI.prototype.getClipList = function() {
  return this.get('/local/camswitcher/clips.cgi?action=get');
}

CamSwitcherAPI.prototype.playlistSwitch = function(playlistName) {
  return this.get('/local/camswitcher/playlist_switch.cgi?playlist_name=' + playlistName);
}

CamSwitcherAPI.prototype.playlistQueueList = function() {
  return this.get('/local/camswitcher/playlist_queue_list.cgi');
}

CamSwitcherAPI.prototype.playlistQueueClear = function() {
  return this.get('/local/camswitcher/playlist_queue_clear.cgi');
}

CamSwitcherAPI.prototype.playlistQueuePush = function(playlistName) {
  return this.get('/local/camswitcher/playlist_queue_push.cgi?playlist_name=' + playlistName);
}

CamSwitcherAPI.prototype.playlistQueuePlayNext = function() {
  return this.get('/local/camswitcher/playlist_queue_play_next.cgi');
}

CamSwitcherAPI.prototype.getOutputInfo = function() {
  return this.get('/local/camswitcher/output_info.cgi');
}

CamSwitcherAPI.prototype.get = function(path) {
  var promise = new Promise((resolve, reject) => {
    var options = this.getBaseConnectionParams();
    options['path'] = encodeURI(path);
    httpRequest(options).then((data) => {
      try {
        let response = JSON.parse(data);
        if (response.status == 200) {
          resolve(response.data);
        } else {
          reject('Request (' + path + ') error, response: ' + JSON.stringify(response));
        }
      } catch (err) {
        reject('Request (' + path + ') error: ' + err  + ', msg: ' + data);
      }
    }, reject);
  });
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