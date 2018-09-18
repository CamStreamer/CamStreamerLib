const fs = require('fs');
const CamOverlayAPI = require('./CamStreamerLib/CamOverlayAPI');

function createImage() {
  var co = new CamOverlayAPI({
    'ip': '127.0.0.1',
    'port': 80,
    'auth': 'root:pass',
    'serviceName': 'Drawing Test',
    'serviceID': -1
  });

  co.on('msg', function(msg) {
    console.log('COAPI-Message: ' + msg);
  });

  co.on('error', function(err) {
    console.log('COAPI-Error: ' + err);
  });

  co.connect().then(function() {
    co.cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 200, 200).then(function(surfaceRes) {
      var surface = surfaceRes.var;
      console.log(surface);

      co.cairo('cairo_create', surface).then(function(cairoRes) {
        var cairo = cairoRes.var;
        console.log(cairo);

        // Create background
        co.cairo('cairo_rectangle', cairo, 0, 0, 200, 200);
        co.cairo('cairo_set_source_rgba', cairo, 0, 0, 0, 0.75);
        co.cairo('cairo_fill', cairo);
        co.cairo('cairo_stroke', cairo);

        co.cairo('cairo_set_line_width', cairo, 1.0);
        co.cairo('cairo_set_source_rgb', cairo, 0.9, 0.9, 0.9);
        co.cairo('cairo_rectangle', cairo, 0, 0, 200, 200);
        co.cairo('cairo_stroke', cairo);

        // Write text
        co.cairo('cairo_set_source_rgb', cairo, 0.9, 0.9, 0.9);
        co.writeText(cairo, 'Hello Left', 5, 50, 190, 15, 'A_LEFT');

        // Write text with different font
        var fontData = fs.readFileSync('FreeSansBold.ttf');
        co.uploadFontData(fontData).then(function(fontRes) {
          var font = fontRes.var;
          console.log(font);

          co.cairo('cairo_set_font_face', cairo, font);
          co.cairo('cairo_set_source_rgb', cairo, 0.0, 0.9, 0.9);
          co.writeText(cairo, 'FreeSans Right', 5, 100, 190, 15, 'A_RIGHT');

          co.cairo('cairo_set_font_face', cairo, 'NULL'); // Reset font
          co.cairo('cairo_set_source_rgb', cairo, 0.9, 0.9, 0.0);
          co.writeText(cairo, 'Center', 5, 150, 190, 15, 'A_CENTER');

          // Load and write image
          var imgData = fs.readFileSync('mstile.png');
          co.uploadImageData(imgData).then(function(imgSurfaceRes) {
            var imgSurface = imgSurfaceRes.var;
            console.log(imgSurface);

            co.cairo('cairo_translate', cairo, 100, 10);
            co.cairo('cairo_scale', cairo, 0.5, 0.5);
            co.cairo('cairo_set_source_surface', cairo, imgSurface, 0, 0);
            co.cairo('cairo_paint', cairo);
            co.cairo('cairo_font_face_destroy', font);
            co.cairo('cairo_surface_destroy', imgSurface);

            co.showCairoImage(surface, -1.0, -1.0).then(function() {
              process.exit(0);
            }, function() {
              process.exit(1);
            });
          });
        });
      });
    });
  }, function(err) {
    if (err)
      console.log(err)
  });
}

createImage();