const fs = require('fs');
const CamOverlayAPI = require('./CamStreamerLib/CamOverlayAPI');

function clockRun() {
  var co = new CamOverlayAPI({
    'ip': '127.0.0.1',
    'port': 80,
    'auth': 'root:pass',
    'serviceName': 'Clock',
    'serviceID': -1
  });

  co.on('msg', function(msg) {
    //console.log('COAPI-Message: ' + msg);
  });

  co.on('error', function(err) {
    console.log('COAPI-Error: ' + err);
    process.exit(1);
  });

  co.connect().then(function() {
    setInterval(createImage, 1000, co);
  });
}

function createImage(co) {
  co.cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 240, 80).then(function(surfaceRes) {
    var surface = surfaceRes.var;
    //console.log(surface);

    co.cairo('cairo_create', surface).then(function(cairoRes) {
      var cairo = cairoRes.var;
      //console.log(cairo);

       // Load image
      var imgData = fs.readFileSync('icon.png');
      co.uploadImageData(imgData).then(function(imgSurfaceRes) {
        var imgSurface = imgSurfaceRes.var;
        //console.log(imgSurface);

        // Create black background with opacity 75%
        co.cairo('cairo_rectangle', cairo, 0, 0, 240, 80);
        co.cairo('cairo_set_source_rgba', cairo, 0, 0, 0, 0.75);
        co.cairo('cairo_fill', cairo);
        co.cairo('cairo_stroke', cairo);

        // Create white 2px outline
        co.cairo('cairo_set_line_width', cairo, 2.0);
        co.cairo('cairo_set_source_rgb', cairo, 0.9, 0.9, 0.9);
        co.cairo('cairo_rectangle', cairo, 0, 0, 240, 80);
        co.cairo('cairo_stroke', cairo);

        // Write Image
        co.cairo('cairo_translate', cairo, 5, 4);
        co.cairo('cairo_scale', cairo, 0.5, 0.5);
        co.cairo('cairo_set_source_surface', cairo, imgSurface, 0, 0);
        co.cairo('cairo_paint', cairo);

        // Write text
        co.cairo('cairo_scale', cairo, 2.0, 2.0);
        co.cairo('cairo_set_source_rgb', cairo, 0.9, 0.9, 0.9);
        var d = new Date();
        co.writeText(cairo, pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2), 75, 10, 150, 38, 'A_LEFT');

        co.showCairoImage(surface, -1.0, -1.0);
        //co.showCairoImageAbsolute(surface, 0, 0, 1920, 1080);

        co.cairo('cairo_surface_destroy', imgSurface);
        co.cairo('cairo_surface_destroy', surface);
        co.cairo('cairo_destroy', cairo);
      });
    });
  });
}

function pad(num, size) {
  var sign = Math.sign(num) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(num)]).join('0').slice(-size);
}

clockRun();