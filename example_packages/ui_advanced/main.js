const url = require('url');
const fs = require('fs');
const HttpServer = require('./CamStreamerLib/HttpServer');

var httpServer = new HttpServer();
httpServer.onRequest('/get_color.cgi', processRequestGetColor);
httpServer.onRequest('/set_color.cgi', processRequestSetColor);

httpServer.on('error', function(err) {
  console.log(err);
});

httpServer.on('access', function(msg) {
  console.log(msg);
});

function processRequestGetColor(req, res) {
  try {
    var data = fs.readFileSync(process.env.PERSISTENT_DATA_PATH + 'mysettings.json');
    var dataJson = JSON.parse(data);
  } catch (err) {
    data = '{"color": "red"}';
  }

  res.statusCode = 200;
  res.setHeader('Content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(data);
}

function processRequestSetColor(req, res) {
  var urlParts = url.parse(req.url, true);
  var query = urlParts.query;
  fs.writeFileSync(process.env.PERSISTENT_DATA_PATH + 'mysettings.json', query.data);

  res.statusCode = 200;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end();
}
console.log('Http server listening on port ' + process.env.HTTP_PORT);

setInterval(function() {
  try {
    var data = fs.readFileSync(process.env.PERSISTENT_DATA_PATH + 'mysettings.json');
    if (data.length) {
      var color = JSON.parse(data).color;
      console.log("Color is " + color);
    }
  } catch (err) {
    console.log("Color is not set yet");
  }
}, 10000);