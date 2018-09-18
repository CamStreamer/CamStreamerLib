const url = require('url');
const fs = require('fs');
const http = require('http');
const CamOverlayAPI = require('./CamStreamerLib/CamOverlayAPI');
const Twitter = require('twitter');

var settingsJson = null;
var twitterStream = null;
var tweetQueue = [];
var tweetQueueCopy = [];
var refreshImageTime = 0;
var co = null;
var posY = 0;
var tweetNum = 0;

function connectCamOverlay() {
  co = new CamOverlayAPI({
    'ip': '127.0.0.1',
    'port': 80,
    'auth': 'root:' + settingsJson.camera_pass,
    'serviceName': 'Twitter',
    'serviceID': -1
  });

  co.on('msg', function(msg) {
    //console.log('COAPI-Message: ' + msg);
  });

  co.on('error', function(err) {
    console.log('COAPI-Message: ' + err);
    process.exit(1);
  });

  return co.connect();
}

function connectTwitter() {
  var client = new Twitter({
    consumer_key: settingsJson.consumer_key,
    consumer_secret: settingsJson.consumer_secret,
    access_token_key: settingsJson.access_token,
    access_token_secret: settingsJson.access_token_secret
  });

  /**
   * Stream statuses filtered by keyword
   * number of tweets per second depends on topic popularity
   **/
  client.stream('statuses/filter', {track: settingsJson.filter},  function(stream) {
    twitterStream = stream;

    twitterStream.on('data', function(tweet) {
      var queueFull = tweetQueue.length == settingsJson.tweets_num;
      tweetQueue.push(tweet);
      while (tweetQueue.length > settingsJson.tweets_num) {
        tweetQueue.shift();
      }

      /*for (var i = tweetQueue.length - 1; i >= 0; i--) {
        printTweet(tweetQueue[i]);
      }*/

      if (Date.now() - refreshImageTime >= settingsJson.refresh_period * 1000) {
        refreshImageTime = Date.now();
        createImage();
      }
    });

    twitterStream.on('error', function(error) {
      console.error(error);
      process.exit(1);
    });
  });
}

function printTweet(tweet) {
  console.log(tweet.user.name);
  console.log('@' + tweet.user.screen_name);
  console.log(tweet.user.profile_image_url);

  if (tweet.truncated) {
    console.log(tweet.extended_tweet.full_text);
  } else {
    console.log(tweet.text);
  }

  if (tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length) {
    console.log(tweet.extended_entities.media[0].media_url);
  }
}

function createImage() {
  co.cairo('cairo_image_surface_create', 'CAIRO_FORMAT_ARGB32', 350, 720).then(function(surfaceRes) {
    var bgImage = surfaceRes.var;

    co.cairo('cairo_create', bgImage).then(function(cairoRes) {
      var cairo = cairoRes.var;

      co.cairo('cairo_rectangle', cairo, 0, 0, 350, 720);
      co.cairo('cairo_set_source_rgba', cairo, 1.0, 1.0, 1.0, 0.8);
      co.cairo('cairo_fill', cairo);
      co.cairo('cairo_stroke', cairo);

      posY = 10;
      tweetNum = tweetQueue.length - 1;
      tweetQueueCopy = [];
      for (var i = 0; i < tweetQueue.length; i++) {
        tweetQueueCopy.push(tweetQueue[i]);
      }

      showTweet(cairo).then(function() {
        co.showCairoImage(bgImage, -1.0, -1.0);

        co.cairo('cairo_surface_destroy', bgImage);
        co.cairo('cairo_destroy', cairo);
      });
    });
  });
}

function showTweet(cairo) {
  var promise = new Promise(function(resolve, reject) {
    if (tweetNum < 0 || tweetNum >= tweetQueueCopy.length) {
      resolve();
      return;
    }

    var tweet = tweetQueueCopy[tweetNum];
    var mediaUrl = '';
    if (tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length) {
      mediaUrl = tweet.extended_entities.media[0].media_url;
    }

    downloadImage(tweet.user.profile_image_url).then(function(userImgData) {
      uploadImageData(userImgData).then(function(userImageRes) {
        downloadImage(mediaUrl).then(function(mediaImgData) {
          uploadImageData(mediaImgData).then(function(mediaImageRes) {

            var userImagePos = posY;
            co.cairo('cairo_set_source_rgb', cairo, 0.0, 0.0, 0.0);
            co.writeText(cairo, tweet.user.name, 65, posY, 330, 17, 'A_LEFT');
            posY += 19;
            co.cairo('cairo_set_source_rgb', cairo, 0.3, 0.3, 0.3);
            co.writeText(cairo, '@' + tweet.user.screen_name, 65, posY, 330, 13, 'A_LEFT');
            posY += 30;

            // Write text
            co.cairo('cairo_set_source_rgb', cairo, 0.0, 0.0, 0.0);
            var text = /*tweet.truncated ? tweet.extended_tweet.full_text :*/ tweet.text;
            var lines = multiParagraphWordWrap(text, 35, '\n').split('\n');
            for (var j = 0; j < lines.length; j++) {
              co.writeText(cairo, lines[j], 10, posY, 330, 18, 'A_LEFT');
              posY += 20;
            }
            posY += 10;

            // Write user image
            co.cairo('cairo_translate', cairo, 10, userImagePos);
            co.cairo('cairo_set_source_surface', cairo, userImageRes.var, 0, 0);
            co.cairo('cairo_paint', cairo);
            co.cairo('cairo_surface_destroy', userImageRes.var);
            co.cairo('cairo_identity_matrix', cairo);

            // Write media image
            if (mediaImageRes.var) {
              // Compute image scale
              const imgMaxW = 330;
              const imgMaxH = 200;
              var scale = Math.min(Math.min(imgMaxW / mediaImageRes.width, imgMaxH / mediaImageRes.height), 1.0);

              co.cairo('cairo_translate', cairo, 10, posY);
              co.cairo('cairo_scale', cairo, scale, scale);
              co.cairo('cairo_set_source_surface', cairo, mediaImageRes.var, 0, 0);
              co.cairo('cairo_paint', cairo);
              co.cairo('cairo_surface_destroy', mediaImageRes.var);
              co.cairo('cairo_identity_matrix', cairo);
              posY += Math.round(mediaImageRes.height * scale) + 10;
            }
            posY += 10;

            tweetNum--;
            showTweet(cairo).then(resolve, reject);

          }, resolve);
        }, resolve);
      }, resolve);
    }, resolve);
  }.bind(this));
  return promise;
}

function downloadImage(imageUrl) {
  var promise = new Promise(function(resolve, reject) {
    if (!imageUrl.length) {
      resolve();
      return;
    }

    var urlParts = url.parse(imageUrl, true);

    var options = {
      'method': 'GET',
      'host': urlParts.hostname,
      'port': 80,
      'path': urlParts.path
    };

    var req = http.request(options, function(resp) {
      var data = null;
      resp.on('data', (chunk) => {
        if (!data) {
          data = Buffer.from(chunk,'binary');
        }
        else {
          data = Buffer.concat([data, Buffer.from(chunk,'binary')]);
        }
      });
      resp.on('end', () => {
        resolve(data);
      });
    }).on("error", (err) => {
      console.error(err);
      reject(err.message);
    });
    req.end();
  }.bind(this));
  return promise;
}

function uploadImageData(data) {
  if (!data) {
    return new Promise(function(resolve, reject) {
      resolve('{"var": null}')
    }.bind(this));
  } else {
    return co.uploadImageData(data);
  }
}

function wordWrap(str, width, delimiter) {
  // use this on single lines of text only
  if (str.length > width) {
    var p = width
    for (; p > 0 && str[p] != ' '; p--) {
    }
    if (p > 0) {
      var left = str.substring(0, p);
      var right = str.substring(p + 1);
      return left + delimiter + wordWrap(right, width, delimiter);
    }
  }
  return str;
}

function multiParagraphWordWrap(str, width, delimiter) {
  // use this on multi-paragraph lines of text
  var arr = str.split(delimiter);

  for (var i = 0; i < arr.length; i++) {
    if (arr[i].length > width)
      arr[i] = wordWrap(arr[i], width, delimiter);
  }

  return arr.join(delimiter);
}

function start() {
 try {
    var data = fs.readFileSync(process.env.PERSISTENT_DATA_PATH + 'settings.json');
    settingsJson = JSON.parse(data);

    connectCamOverlay().then(function() {
      connectTwitter();
    });

  } catch (err) {
    console.error("Invalid settings JSON");
  }
}

start();