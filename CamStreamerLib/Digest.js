var crypto = require('crypto');

var Digest = {
  getAuthHeader: function(user, pass, method, uri, wwwAuthenticateHeader) {
    if (method == undefined) {
      method = 'GET';
    }

    var digestItems = {};
    var digestArr = wwwAuthenticateHeader.substr(wwwAuthenticateHeader.indexOf('Digest') + 6).split(',');
    for (var i = 0; i < digestArr.length; i++) {
      var pos = digestArr[i].indexOf('=');
      var item = [digestArr[i].substr(0, pos), digestArr[i].substr(pos + 1)]
      digestItems[item[0].trim()] = item[1].trim().replace(/"/g,'');
    }

    var HA1 = crypto.createHash('md5').update(user + ":" + digestItems["realm"] + ":" + pass).digest("hex");
    var HA2 = crypto.createHash('md5').update(method + ":" + uri).digest("hex");
    var response;
    if (digestItems['qop'] != undefined) {
      response = crypto.createHash('md5').update(HA1 + ":" + digestItems["nonce"] + ':00000001:162d50aa594e9648:auth:' + HA2).digest("hex");
    } else {
      response = crypto.createHash('md5').update(HA1 + ":" + digestItems["nonce"] + ':' + HA2).digest("hex");
    }

    var header = 'Digest ' +
      'username="' + user + '",' +
      'realm="' + digestItems['realm'] + '",' +
      'nonce="' + digestItems['nonce'] + '",' +
      'uri="' + uri + '",' +
      'response="' + response + '"';

    if (digestItems['qop'] != undefined) {
      header += ',qop=auth,nc=00000001,cnonce="162d50aa594e9648"';
    }

    return header;
  }
}

module.exports = Digest