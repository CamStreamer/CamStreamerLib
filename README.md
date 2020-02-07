# CamStreamerLib
Node.js helper library for CamStreamer ACAP applications.

The library is primarily developed for CamScripter Acap application running directly in Axis cameras.
Examples of CamScripter packages can be found at https://github.com/CamStreamer/CamScripterApp_examples

## Installation
```
npm install camstreamerlib
```

# Documentation for Node.js modules

## HttpServer
HttpServer is a module for processing HTTP requests in your scripts. It also automatically serves up the content from html directory or you can register paths which you can proccess by your own.

### methods
#### onRequest(path, callback)
It registers callback for access to specified path. Callback has attributes - request and response.
##### example
```javascript
httpServer.onRequest('/settings.cgi', function(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('{"enabled": true}');
});
```

### events
#### access(msg)
The Event is emitted for all HTTP requests to this server
#### error(err)
An error occurs


## CameraVapix
Access to Axis camera VAPIX interface. For more details see documentation for Axis camera VAPIX library.

### methods
#### CameraVapix(options)
```javascript
options = {
  'protocol': 'http',
  'ip': '127.0.0.1',
  'port': 80,
  'auth': 'root:pass'
}
```

#### vapixGet(groupNames)
Universal method for HTTP GET requests to camera VAPIX API.
##### example
```javascript
vapixGet('/axis-cgi/param.cgi?action=list&group=camscripter')
```

#### vapixPost(groupNames)
Universal method for HTTP POST requests to camera VAPIX API.
##### example
```javascript
vapixPost('/axis-cgi/param.cgi', 'action=update&camscripter.enabled=1')
```

#### getParameterGroup(groupNames)
Get parameters from the camera.
##### example
```javascript
getParameterGroup('camscripter','camoverlay')
```

#### setParameter(params)
Set parameters to the camera.
##### example
```javascript
setParameter('{"root.camscripter.Enabled": "1"}')
```

#### getPTZPresetList(channel)
Get a list of PTZ presets for the specified channel. Channels are numbered from 1.
##### example
```javascript
getPTZPresetList(1)
```

#### goToPreset(channel, presetName)
Move the camera channel to the PTZ preset.
##### example
```javascript
goToPreset(1, 'home')
```

#### getGuardTourList()
Get the list of guard tours.
##### example
```javascript
getGuardTourList()
```

#### setGuardTourEnabled(gourTourID, enable)
Enable or disable the guard tour.
##### example
```javascript
setGuardTourEnabled('root.GuardTour.G0', true)
```

#### getInputState(port)
Get the camera input state for the specified port number.
##### example
```javascript
getInputState(2)
```

#### setOutputState(port, active)
Set the state of the camera output port.
##### example
```javascript
setOutputState(2, true)
```

#### getApplicationList()
Get the list of installed Acap applications.
##### example
```javascript
getApplicationList()
```

#### getEventDeclarations()
Get all the available camera events in JSON format.
##### example
```javascript
getEventDeclarations()
```

### events
#### eventsConnect
Events connection is ready
#### eventsDisconnect(err)
Events connection error
#### *
You can listen for events from camera by registrating the appropriate topic
##### example
```javascript
on('axis:CameraApplicationPlatform/VMD/Camera1Profile1/.', function(event) {})
```


## CamStreamerAPI
Module for easy control of streaming in CamStreamer Acap application.

### methods
#### CameraVapix(options)
```javascript
options = {
  'protocol': 'http',
  'ip': '127.0.0.1',
  'port': 80,
  'auth': 'root:pass'
}
```

#### getStreamList()
Get info about CamStreamer streams in JSON format.
##### example
```javascript
getStreamList()
```

#### getStreamParameter(streamID, paramName)
Get a single parameter of the stream with specified ID.
##### example
```javascript
getStreamParameter('1234', 'enabled')
```

#### setStreamParameter(streamID, paramName, value)
Set value of stream parameter.
##### example
```javascript
setStreamParameter('1234', 'enabled', '1')
```

#### isStreaming(streamID)
Return the state of streaming.
##### example
```javascript
isStreaming('1234')
```


## CamOverlayAPI
Module for easy control of CamOverlay drawing API. For more details on supported drawing functions see https://camstreamer.com/camoverlay-api1

### methods
#### CameraVapix(options)
Options parameter contains access to the camera, service name, service ID and camera. If service ID is not specified, service is automatically created/selected based on serviceName. Specify video channel using parameter camera (in which View Area overlay will be shown). If omitted the default value camera=0 is used.
```javascript
options = {
  'ip': '127.0.0.1',
  'port': 80,
  'auth': 'root:pass',
  'serviceName': 'Drawing Test',
  'serviceID': -1,
  'camera': 0
}
```

#### connect()
Connect to CamOverlay WebSocket drawing API.
##### example
```javascript
connect()
```

#### cairo(command, args...)
Call a function from Cairo library. See https://cairographics.org/manual/
##### example
```javascript
cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 200, 200) // https://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-image-surface-create
```

#### writeText(cairoContext, text, posX, posY, width, height, align)
Write aligned text to the box specified by x, y coordinates, width and height. Alignment options: A_RIGHT, A_LEFT, A_CENTER. Text size is adjusted to width and height of the box.
##### example
```javascript
writeText('cairo0', 'Hello World', 5, 100, 190, 15, 'A_RIGHT');
```

#### uploadImageData(imgBuffer)
Upload .jpg or .png image to the CamOverlay application. Function returns variable name and dimensions of the image.
##### example
```javascript
uploadImageData(fs.readFileSync('image.png'))
```

#### uploadFontData(fontBuffer)
Upload .ttf font to the CamOverlay application.
##### example
```javascript
uploadFontData(fs.readFileSync('font.ttf'))
```

#### showCairoImage(cairoImage, posX, posY)
Show image in video stream from the camera. Position is in coordinates -1.0, -1.0 (upper left) / 1.0, 1.0 (bootom right).
##### example
```javascript
showCairoImage('surface0', -1.0, -1.0)
```

#### showCairoImageAbsolute(cairoImage, posX, posY, width, height)
Show image in video stream from the camera. Position is absolute in pixels, stream resolution is required, because it can be called once there is no video stream running yet.
##### example
```javascript
showCairoImage('surface0', 100, 100, 1920, 1080)
```

#### removeImage()
Remove image from the camera stream.
##### example
```javascript
removeImage()
```

### events
#### msg(msg)
WebSocket message received
#### error(err)
An error occurs
#### close
WebSocket closed

