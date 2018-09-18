const url = require('url');
const fs = require('fs');
const CamOverlayAPI = require('./CamStreamerLib/CamOverlayAPI');

var settings = null;

var co = null;
var imgClockFace = null;
var imgCentre = null;
var imgHourHand = null;
var imgMinuteHand = null;
var imgSecondHand = null;

function clockRun() {
  try {
    var data = fs.readFileSync(process.env.PERSISTENT_DATA_PATH + 'settings.json');
    settings = JSON.parse(data);
  } catch (err) {
    console.log('No settings file found');
    return;
  }

  co = new CamOverlayAPI({
    'ip': '127.0.0.1',
    'port': 80,
    'auth': settings.camera_user + ':' + settings.camera_pass,
    'serviceName': 'Analog Clock',
    'serviceID': -1,
  });

  co.on('msg', function(msg) {
    //console.log('COAPI-Message: ' + msg);
  });

  co.on('error', function(err) {
    console.log('COAPI-Error: ' + err);
  });

  co.on('close', function() {
    console.log('COAPI-Error: connection closed');
    process.exit(1);
  });

  co.connect().then(function() {
    setInterval(createImage, 1000, co);
  }, function () {
    console.log('COAPI-Error: connection error');
  });
}

function createImage(co) {
  loadImages().then(function() {
    co.cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', Math.floor(263 * settings.scale), Math.floor(265 * settings.scale)).then(function(surfaceRes) {
      var surface = surfaceRes.var;
      co.cairo('cairo_create', surface).then(function(cairoRes) {
        var cairo = cairoRes.var;

        // Write clock face
        co.cairo('cairo_scale', cairo, settings.scale, settings.scale);
        co.cairo('cairo_translate', cairo, 0, 0);
        co.cairo('cairo_set_source_surface', cairo, imgClockFace, 0, 0);
        co.cairo('cairo_paint', cairo);

        var d = new Date();
        var hourAngle = (d.getHours() + d.getMinutes() / 60) / 12 * 2 * Math.PI + Math.PI;
        var minAngle = (d.getMinutes() + (d.getSeconds() + 1) / 60) / 60 * 2 * Math.PI + Math.PI;
        var secAngle = (d.getSeconds() + 1) / 60 * 2 * Math.PI + Math.PI;

        // Write hours
        co.cairo('cairo_identity_matrix', cairo);
        co.cairo('cairo_scale', cairo, settings.scale, settings.scale);
        co.cairo('cairo_translate', cairo, 131, 132);
        co.cairo('cairo_rotate', cairo, hourAngle);
        co.cairo('cairo_translate', cairo, -5, -16);
        co.cairo('cairo_set_source_surface', cairo, imgHourHand, 0, 0);
        co.cairo('cairo_paint', cairo);

        // Write minutes
        co.cairo('cairo_identity_matrix', cairo);
        co.cairo('cairo_scale', cairo, settings.scale, settings.scale);
        co.cairo('cairo_translate', cairo, 131, 132);
        co.cairo('cairo_rotate', cairo, minAngle);
        co.cairo('cairo_translate', cairo, -5, -20);
        co.cairo('cairo_set_source_surface', cairo, imgMinuteHand, 0, 0);
        co.cairo('cairo_paint', cairo);

        // Write seconds
        co.cairo('cairo_identity_matrix', cairo);
        co.cairo('cairo_scale', cairo, settings.scale, settings.scale);
        co.cairo('cairo_translate', cairo, 131, 132);
        co.cairo('cairo_rotate', cairo, secAngle);
        co.cairo('cairo_translate', cairo, 0, -20);
        co.cairo('cairo_set_source_surface', cairo, imgSecondHand, 0, 0);
        co.cairo('cairo_paint', cairo);

        // Write clock center
        co.cairo('cairo_identity_matrix', cairo);
        co.cairo('cairo_scale', cairo, settings.scale, settings.scale);
        co.cairo('cairo_translate', cairo, 125, 127);
        co.cairo('cairo_set_source_surface', cairo, imgCentre, 0, 0);
        co.cairo('cairo_paint', cairo);

        co.showCairoImageAbsolute(surface, settings.pos_x, settings.pos_y, settings.width, settings.height);

        // Cleanup
        co.cairo('cairo_surface_destroy', surface);
        co.cairo('cairo_destroy', cairo);
      });
    });
  }, function() {})
}

function loadImages() {
  var promise = new Promise(function(resolve, reject) {
    if (imgClockFace == null) {
      loadImage('clock_face.png').then(function(img) {
        imgClockFace = img;
        loadImage('centre.png').then(function(img) {
          imgCentre = img;
          loadImage('hour_hand.png').then(function(img) {
            imgHourHand = img;
            loadImage('minute_hand.png').then(function(img) {
              imgMinuteHand = img;
              loadImage('sec_hand.png').then(function(img) {
                imgSecondHand = img;
                resolve();
              });
            });
          });
        });
      });
    } else {
      resolve();
    }
  });
  return promise;
}

function loadImage(fileName) {
  var promise = new Promise(function(resolve, reject) {
    var imgData = fs.readFileSync(fileName);
    co.uploadImageData(imgData).then(function(imgSurfaceRes) {
      resolve(imgSurfaceRes.var);
    });
  });
  return promise;
}

process.on('unhandledRejection', function(error) {
  console.log('unhandledRejection', error.message);
});

clockRun();