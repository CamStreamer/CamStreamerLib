$(document).ready(function() {
  $.get('/local/camscripter/package/settings.cgi?package_name=ui&action=get', function(data) {
    if (Object.keys(settings).length == 0) {
      data = {'color': 'red'};
    }

    $('#preview').css('backgroundColor', data.color);
    $('input[name=color][value="' + data.color + '"]').prop('checked', true);
  });

  $(".color").click(radioClickedCallback);
});

function radioClickedCallback() {
  $('#preview').css('backgroundColor', $(this).val());
  var data = '{"color": "' + $(this).val() + '"}';
  $.post('/local/camscripter/package/settings.cgi?package_name=ui&action=set', data, function(data) {});
}
