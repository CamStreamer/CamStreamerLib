$(document).ready(function() {
  $.get('/local/camscripter/package/ui_advanced/proxy/get_color.cgi', function(data) {
    $('#preview').css('backgroundColor', data.color);
    $('input[name=color][value="' + data.color + '"]').prop('checked', true);
  });

  $(".color").click(radioClickedCallback);
});

function radioClickedCallback() {
  $('#preview').css('backgroundColor', $(this).val());
  var data = '{"color": "' + $(this).val() + '"}';
  $.get('/local/camscripter/package/ui_advanced/proxy/set_color.cgi?data=' + data, function(data) {});
}
