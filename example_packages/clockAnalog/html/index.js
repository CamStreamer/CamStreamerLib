$(document).ready(function() {

  $.get('/local/camscripter/package/settings.cgi?package_name=clockAnalog&action=get', function(settings) {
    console.log(settings);
    if (Object.keys(settings).length == 0) {
      settings = {"camera_user": "root", "camera_pass": "", "pos_x": 0, "pos_y": 0, "width": 1920, "height": 1080, "scale": 1.0};
    }

    $('#userCam').val(settings.camera_user);
    $('#passCam').val(settings.camera_pass);
    $('#posX').val(settings.pos_x);
    $('#posY').val(settings.pos_y);
    $('#width').val(settings.width);
    $('#height').val(settings.height);
    $('#scale').val(settings.scale);
  });

  $(".form-control").change(inputChanged);

  $(".myForm").submit(function() {
    return false;
  });
});

function inputChanged() {
  console.log('param changed');
  var settings = {
    'camera_user': $('#userCam').val(),
    'camera_pass': $('#passCam').val(),
    'pos_x': parseInt($('#posX').val()),
    'pos_y': parseInt($('#posY').val()),
    'width': parseInt($('#width').val()),
    'height': parseInt($('#height').val()),
    'scale': parseFloat($('#scale').val())
  };
  $.post('/local/camscripter/package/settings.cgi?package_name=clockAnalog&action=set', JSON.stringify(settings), function(data) {});
}