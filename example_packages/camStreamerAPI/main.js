const fs = require('fs');
const CamStreamerAPI = require('./CamStreamerLib/CamStreamerAPI');

var cs = new CamStreamerAPI({
  'protocol': 'http',
  'ip': '127.0.0.1',
  'port': 80,
  'auth': 'root:pass',
});

cs.getStreamList().then(function(streamList) {
  console.log(streamList);

  for (streamID in streamList) {
    console.log(streamID);
    cs.getStreamParameter(streamID, 'enabled').then(function(enabled) {
      console.log('enabled: ' + enabled);
      cs.setStreamParameter(streamID, 'enabled', enabled == '1' ? '0' : '1').then(function(response) {
        console.log(response);
      }, function(err) {
        console.log(err);
      });
    }, function(err) {
      console.log(err);
    });

    cs.isStreaming(streamID).then(function(streaming) {
      console.log('isStreaming: ' + streaming);
    }, function(err) {
      console.log(err);
    });
    break;
  }

}, function(err) {
  console.log(err);
});

