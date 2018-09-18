const fs = require('fs');
const CameraVapix = require('./CamStreamerLib/CameraVapix');

var cv = new CameraVapix({
  'protocol': 'http',
  'ip': '127.0.0.1',
  'port': 80,
  'auth': 'root:pass',
});

function testParams() {
  // Read all parameters for camscripter application
  cv.getParameterGroup('Camscripter').then(function(params) {
    console.log(params);
    params['root.Camscripter.Enabled'] = (parseInt(params['root.Camscripter.Enabled']) + 1) % 2;  // Change enabled parameter

    // Send all parameters back to camera
    cv.setParameter(params).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });

  }, function(err) {
    console.log(err);
  });
}

function testVapixGet() {
  cv.vapixGet('/axis-cgi/param.cgi?action=list&group=camscripter').then(function(response) {
    console.log(response);
  }, function(err) {
    console.log(err);
  });
}

function testVapixPost() {
  var data = 'action=update&camscripter.enabled=1';
  cv.vapixPost('/axis-cgi/param.cgi', data).then(function(response) {
    console.log(response);
  }, function(err) {
    console.log(err);
  });
}

function testPTZ() {
  cv.getPTZPresetList(1).then(function(presetNames) {
    console.log(presetNames);
    if (presetNames.length > 1) {
      cv.goToPreset(1, presetNames[1]).then(function(response) {
        console.log(response);
      });
    }
  }, function(err) {
    console.log(err);
  });

  cv.getGuardTourList().then(function(gTours) {
    console.log(gTours);
    if (gTours.length >= 1) {
      var enabled = gTours[0].Running == 'yes';
      cv.setGuardTourEnabled(gTours[0].ID, !enabled).then(function(response) {
        console.log(response);
      }, function(err) {
        console.log(err);
      });
    }
  }, function(err) {
    console.log(err);
  });
}

function testInputs() {
  cv.getInputState(2).then(function(active) {
    console.log(active);
    cv.setOutputState(2, !active).then(function(response) {
      console.log(response);
    }, function(err) {
      console.log(err);
    });
  }, function(err) {
    console.log(err);
  });
}

function testApplicationApi() {
  cv.getApplicationList().then(function(response) {
    console.log(response);
  }, function(err) {
    console.log(err);
  });
}

testParams();
//testVapixGet();
//testVapixPost();
//testPTZ();
//testInputs();
//testApplicationApi();