const http = require("http");
const https = require("https");
const Digest = require("./Digest");

function httpRequest(options, postData, noWaitForData) {
  return new Promise(
    function (resolve, reject) {
      if (postData != undefined) {
        options.headers = options.headers || {};
        if (options.headers["Content-Type"] == undefined) {
          options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
        options.headers["Content-Length"] = Buffer.byteLength(postData);
      }

      request(options, postData, undefined, noWaitForData).then(function (response) {
        if (response.resp.statusCode == 200) {
          resolve(response.data);
        } else if (response.resp.statusCode == 401) {
          if (
            response.resp.headers["www-authenticate"] != undefined &&
            response.resp.headers["www-authenticate"].indexOf("Digest") != -1
          ) {
            request(
              options,
              postData,
              response.resp.headers["www-authenticate"],
              noWaitForData
            ).then(function (response) {
              if (response.resp.statusCode == 200) {
                resolve(response.data);
              } else {
                reject(
                  "Error: status code: " +
                    response.resp.statusCode +
                    ", " +
                    response.data
                );
              }
            }, reject);
          } else {
            reject(
              "Error: status code: " +
                response.resp.statusCode +
                ", " +
                response.data
            );
          }
        } else {
          reject(
            "Error: status code: " +
              response.resp.statusCode +
              ", " +
              response.data
          );
        }
      }, reject);
    }.bind(this)
  );
}

function request(options, postData, digestHeader, noWaitForData) {
  return Promise((resolve, reject) => {
    if (digestHeader != undefined) {
      let auth = options.auth;
      if (auth == undefined) {
        reject("No credentials found");
      }
      auth = auth.split(":");
      delete options.auth;

      if (options.method == undefined) {
        options.method = "GET";
      }

      options.headers = options.headers || {};
      options["headers"]["Authorization"] = Digest.getAuthHeader(
        auth[0],
        auth[1],
        options.method,
        options.path,
        digestHeader
      );
    }
    let client = http;

    if (options.protocol && options.protocol === "https:") {
      client = https;
    }
    let req = client
      .request(options, function (resp) {
        if (!noWaitForData){
          let data = "";
          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            resolve({ resp: resp, data: data });
          });
        } else {
          resolve({resp : resp});
        }
      }).on("error", (err) => {
        reject(err.message);
      });

    if (postData != undefined) {
      req.write(postData);
    }
    req.end();
  });
}

module.exports = httpRequest;
