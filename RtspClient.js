const net = require('net');
const util = require('util');
const EventEmitter = require('events');

const Digest = require('./Digest');

function RtspClient(options) {
  this.ip = '127.0.0.1';
  this.port = 80;
  this.auth = '';
  if (options) {
    this.ip = options['ip'] || this.ip;
    this.port = options['port'] || 80;
    this.auth = options['auth'] || this.auth;
  }

  this.authorizationType = 'basic';
  this.wwwAuthenticateHeader = '';
  this.sessioncookie = Math.random().toString(36).substring(7);
  this.clientGet = null;
  this.clientPost = null;
  this.imputBuffer = null;
  this.state = 'HTTP_INIT';
  this.rtspPath = '';
  this.rtspCSeq = 0;
  this.control = '';
  this.session = '';
  this.authorizationSent = false;

  this.keepAliveTimer = null;
  this.disconnected = false;
  this.rtpMsgBuffer = '';

  EventEmitter.call(this);
}

util.inherits(RtspClient, EventEmitter);

RtspClient.prototype.connect = function(eventTopicFilter) {
  this.rtspPath = '/axis-media/media.amp?video=0&audio=0&event=on';
  if (eventTopicFilter && eventTopicFilter.length) {
    this.rtspPath += '&eventtopic=' + eventTopicFilter;
  }

  // Start GET connection
  this.clientGet = new net.Socket();
  this.clientGet.connect(this.port, this.ip, function() {
    //console.log('Connected GET');
    this.clientGet.write(this.getInitializationMessageGet());
  }.bind(this));

  this.clientGet.on('data', this.processGetMessage.bind(this));

  this.clientGet.on('close', this.closeConnection.bind(this));

  // Start POST connection
  this.clientPost = new net.Socket();
  this.clientPost.connect(this.port, this.ip, function() {
    //console.log('Connected POST');
    this.clientPost.write(this.getInitializationMessagePost());
  }.bind(this));

  this.clientPost.on('data', function(data) {
    //console.log('Received POST: ' + data);
  }.bind(this));

  this.clientPost.on('close', this.closeConnection.bind(this));
}

RtspClient.prototype.disconnect = function() {
  this.closeConnection('');
}

RtspClient.prototype.closeConnection = function(reason) {
  if (!this.disconnected) {
    this.disconnected = true;
    this.emit('disconnect', reason);
  }

  clearInterval(this.keepAliveTimer);
  this.clientGet.destroy();
  this.clientPost.destroy();
}

RtspClient.prototype.processGetMessage = function(data) {
  if (!this.inputBuffer) {
    this.inputBuffer = Buffer.from(data,'binary');
  }
  else {
    this.inputBuffer = Buffer.concat([this.inputBuffer, Buffer.from(data,'binary')]);
  }

  if (this.state == 'HTTP_INIT') {
    var msg = this.parseRtspMessage();
    if (msg) {
      if (msg.statusLine.indexOf('200 OK') != -1) {
        this.state = 'RTSP_OPTION';
        this.sendRtspMessage(this.getRtspMessage());
      } else if (msg.statusLine.indexOf('401') != -1 && !this.authorizationSent) {
        this.authorizationSent = true;
        this.authorizationType = 'digest';
        this.wwwAuthenticateHeader = msg.headers['www-authenticate'];
        this.clientGet.write(this.getInitializationMessageGet());
      } else {
        this.closeConnection(msg.statusLine);
      }
    }
    return;
  }

  while (this.inputBuffer.length > 0) {
    var msgType = '';
    var firstChar = String.fromCharCode(this.inputBuffer[0]);
    if (firstChar == 'R') {
      msgType = 'RTSP';
    } else if (firstChar == '$') {
      msgType = 'RTP';
    } else {
      this.closeConnection('Unknown message found: ' + this.inputBuffer);
      return;
    }

    if (msgType == 'RTSP') {
      var msg = this.parseRtspMessage();
      if (!msg) {
        break;
      }

      if (msg.statusLine.indexOf('401') != -1 && !this.authorizationSent) {
        this.authorizationSent = true;
        this.authorizationType = 'digest';
        this.wwwAuthenticateHeader = msg.headers['www-authenticate'];
        this.sendRtspMessage(this.getRtspMessage());
        return;
      }

      if (this.state != 'HTTP_INIT' && msg.statusLine.indexOf('RTSP/1.0 200 OK') == -1) {
        this.closeConnection('Invalid RTSP response: ' + msg.headersRaw + msg.body);
        return;
      }

      this.authorizationSent = false; // Authorization expires for digest method
      switch (this.state) {
        case 'RTSP_OPTION': {
          this.state = 'RTSP_DESCRIBE';
          this.sendRtspMessage(this.getRtspMessage());
          break;
        }
        case 'RTSP_DESCRIBE': {
          const regex = /(a=control):(.*)/g;
          this.control = regex.exec(msg.body)[2];
          this.state = 'RTSP_SETUP';
          this.sendRtspMessage(this.getRtspMessage());
          break;
        }
        case 'RTSP_SETUP': {
          this.session = msg.headers['session'].split(';')[0];
          this.state = 'RTSP_PLAY';
          this.sendRtspMessage(this.getRtspMessage());
          break;
        }
        case 'RTSP_PLAY': {
          this.emit('connect');
          this.state = 'RTSP_GET_PARAMETER';
          this.keepAliveTimer = setInterval(function() {
            this.sendRtspMessage(this.getRtspMessage());
          }.bind(this), 30000);
          break;
        }
      }
    } else if (msgType == 'RTP') {
      var msg = this.parseRtpMessage();
      if (!msg) {
        break;
      }

      if (msg.channel == 0) {
        this.rtpMsgBuffer += msg.body.toString();
        while (true) {
          var msgEnd = this.rtpMsgBuffer.indexOf('</tt:MetadataStream>');
          if (msgEnd == -1) {
            break;
          }
          this.emit('event', this.rtpMsgBuffer.substring(0, msgEnd + 20));
          this.rtpMsgBuffer = this.rtpMsgBuffer.substring(msgEnd + 20);
        }
      }
    }
  }
}

RtspClient.prototype.parseRtspMessage = function() {
  var msgEndFound = this.inputBuffer.indexOf('\r\n\r\n');
  if (msgEndFound == -1) {
    return null;
  }

  var msgHeaders = this.inputBuffer.slice(0, msgEndFound + 4);
  const headers = {};
  const regex = /([\w-]+): (.*)/g;
  var tmp;
  while (tmp = regex.exec(msgHeaders)) {
    headers[tmp[1].toLowerCase()] = tmp[2];
  }

  var msgSize = msgEndFound + 4;
  if (headers['content-length'] != undefined) {
    msgSize += parseInt(headers['content-length']);
  }
  var body = this.inputBuffer.slice(msgEndFound + 4, msgSize);
  this.inputBuffer = this.inputBuffer.slice(msgSize);

  return {'statusLine': msgHeaders.slice(0, msgHeaders.indexOf('\r\n')), 'headers': headers, 'headersRaw': msgHeaders, 'body': body};
}

RtspClient.prototype.parseRtpMessage = function() {
  const INTERLEAVED_HEADER_SIZE = 4;
  const RTP_HEADER_SIZE = 12;
  if (this.inputBuffer.length < INTERLEAVED_HEADER_SIZE) { // Not enough data even for rtp header. Try again when more data is available
    return null;
  }

  var channel = this.inputBuffer[1]; // Interleaved channel, 0 - RTP, 1 - RTCP
  var msgDataSize = (this.inputBuffer[2] << 8) | this.inputBuffer[3];
  msgDataSize += INTERLEAVED_HEADER_SIZE;

  // Ivalid input data - invalid channel
  if (channel < 0 || channel > 1)
  {
    this.closeConnection("InterleavedMessage - invalid channel found: " + channel);
    return null;
  }

  // The complete RTP package is not here yet, wait for more data
  if (msgDataSize > this.inputBuffer.length) {
    return null;
  }

  var body = this.inputBuffer.slice(INTERLEAVED_HEADER_SIZE + RTP_HEADER_SIZE, msgDataSize);
  this.inputBuffer = this.inputBuffer.slice(msgDataSize);
  return {'channel': channel, 'body': body};
}

RtspClient.prototype.getInitializationMessageGet = function() {
  var data = 'GET /axis-media/media.amp HTTP/1.1\r\n' +
    'CSeq: 1\r\n' +
    'User-Agent: Camstreamer RTSP Client\r\n' +
    'Host: ' + this.ip + '\r\n' +
    'x-sessioncookie: ' + this.sessioncookie + '\r\n' +
    'Accept: application/x-rtsp-tunnelled\r\n' +
    'Pragma: no-cache\r\n' +
    'Authorization: ' + this.getAuthHeader('GET', '/axis-media/media.amp') + '\r\n' +
    'Cache-Control: no-cache\r\n\r\n';
  return data;
}

RtspClient.prototype.getInitializationMessagePost = function() {
  var data = 'POST /axis-media/media.amp HTTP/1.1\r\n' +
    'CSeq: 1\r\n' +
    'User-Agent: Camstreamer RTSP Client\r\n' +
    'Host: ' + this.ip + '\r\n' +
    'x-sessioncookie: ' + this.sessioncookie + '\r\n' +
    'Content-Type: application/x-rtsp-tunnelled\r\n' +
    'Pragma: no-cache\r\n' +
    'Cache-Control: no-cache\r\n' +
    'Authorization: ' + this.getAuthHeader('POST', '/axis-media/media.amp') + '\r\n' +
    'Content-Length: 32767\r\n\r\n';
  return data;
}

RtspClient.prototype.getRtspMessage = function() {
  this.rtspCSeq++;
  switch (this.state) {
    case 'RTSP_OPTION': {
      return 'OPTIONS ' + this.rtspPath + ' RTSP/1.0\r\n' +
        'CSeq: ' + this.rtspCSeq + '\r\n' +
        'User-Agent: Camstreamer RTSP Client\r\n' +
        'Authorization: ' + this.getAuthHeader('OPTIONS', this.rtspPath) + '\r\n\r\n';
    }
    case 'RTSP_DESCRIBE': {
      return 'DESCRIBE ' + this.rtspPath + ' RTSP/1.0\r\n' +
        'CSeq: ' + this.rtspCSeq + '\r\n' +
        'User-Agent: Camstreamer RTSP Client\r\n' +
        'Authorization: ' + this.getAuthHeader('DESCRIBE', this.rtspPath) + '\r\n' +
        'Accept: application/sdp\r\n\r\n';
    }
    case 'RTSP_SETUP': {
      return 'SETUP ' + this.control + ' RTSP/1.0\r\n' +
        'CSeq: ' + this.rtspCSeq + '\r\n' +
        'User-Agent: Camstreamer RTSP Client\r\n' +
        'Authorization: ' + this.getAuthHeader('SETUP', this.rtspPath) + '\r\n' +
        'Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n\r\n';
    }
    case 'RTSP_PLAY': {
      return 'PLAY ' + this.rtspPath + ' RTSP/1.0\r\n' +
        'CSeq: ' + this.rtspCSeq + '\r\n' +
        'User-Agent: Camstreamer RTSP Client\r\n' +
        'Authorization: ' + this.getAuthHeader('PLAY', this.rtspPath) + '\r\n' +
        'Session: ' + this.session + '\r\n' +
        'Range: npt=0.000-\r\n\r\n'
    }
    case 'RTSP_GET_PARAMETER': {
      return 'GET_PARAMETER ' + this.rtspPath + ' RTSP/1.0\r\n' +
        'CSeq: ' + this.rtspCSeq + '\r\n' +
        'User-Agent: Camstreamer RTSP Client\r\n' +
        'Authorization: ' + this.getAuthHeader('GET_PARAMETER', this.rtspPath) + '\r\n' +
        'Session: ' + this.session + '\r\n\r\n';
    }
  }
}

RtspClient.prototype.getAuthHeader = function(method, path) {
  if (this.authorizationType == 'basic') {
    return 'Basic ' + Buffer.from(this.auth).toString('base64');
  } else {
    var userPass = this.auth.split(':');
    return Digest.getAuthHeader(userPass[0], userPass[1], method, path, this.wwwAuthenticateHeader);
  }
}

RtspClient.prototype.sendRtspMessage = function(message) {
  //console.log(message);
  var msgBase64 = Buffer.from(message).toString('base64');
  this.clientPost.write(msgBase64);
}

module.exports = RtspClient;