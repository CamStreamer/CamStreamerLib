var fs  = require('fs');

var color = null;
try {
  var data = fs.readFileSync(process.env.PERSISTENT_DATA_PATH + 'settings.json');
  if (data.length) {
    color = JSON.parse(data).color;
  }
} catch (err) {
}

function printColor() {
  if (color) {
    console.log("Color is " + color);
  } else {
    console.log("Color is not set yet");
  }
}

printColor();
setInterval(function() {
  printColor();
}, 10000);