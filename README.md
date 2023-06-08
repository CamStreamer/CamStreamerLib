# CamStreamerLib

Node.js helper library for CamStreamer ACAP applications.

The library is primarily developed for CamScripter Acap application running directly in Axis cameras.
Examples of CamScripter packages can be found at https://github.com/CamStreamer/CamScripterApp_examples

## Installation

```
npm install camstreamerlib
```

# Documentation for Node.js modules

-   [HttpServer](doc/HttpServer.md)
-   [CameraVapix](doc/CameraVapix.md)
-   [CamStreamerAPI](doc/CamStreamerAPI.md)
-   [CamOverlayAPI](doc/CamOverlayAPI.md)
-   [CamScripterAPICameraEventsGenerator](doc/CamScripterAPICameraEventsGenerator.md)

## For Developers

### Publishing to npm repository

1. Update version in package.json and push it
2. Create git tag e.g. v1.2.4

-   `git tag v1.2.4`
-   `git push --tags`

3. Publish new version to npm

-   `npm publish ./dist`

4. Edit GitHub release form.

### Preparing a package to upload to CamScripter

If you want to create your own package and upload it to CamScripter App, you can use the script CreatePackage. It creates a zip file which contains all required files and directories in your package folder. The script accepts source code written either in JavaScript or TypeScript if the package has the correct structure (more information in https://github.com/CamStreamer/CamScripterApp_examples/#readme). To include this script in your package add the following lines in the file package.json:

```json
"scripts": {
    "create-package": "node node_modules/camstreamerlib/CreatePackage.js"
  }
```

By default, the zipped package does not contain node_modules directory. If you want to include it (required when uploading to CamScripter App on Axis camera), add `-includeNodeModules` or `-i` parameter.

If you need to exclude a file or directory add `-exlude` or `-e` parameter with comma separated list.

```json
"scripts": {
    "create-package": "node node_modules/camstreamerlib/CreatePackage.js -i -e=react"
}
```
