# http-recorder

A tool to record and play back raw http requests.

## Usage

This module ships with a simple http-recorder command line tool that takes
two optional arguments.

``` bash
http-recorder $PORT $DIRECTORY
```

`$PORT` defaults to 8080 and `$DIRECTORY` defaults to `process.cwd()`.

Once started, http-recorder listens for incoming connections, and stores the
raw incoming http in a file called `connection_<id>.http`. `id` is an integer
starting at 1 that increments with each incoming connection (not request).

Alternatively, you can also use the module programatically.

``` javascript
var HttpRecorder = require('http-recorder');

var recorder = HttpRecorder.create({
  directory: __dirname
});
recorder.listen(8080);
```
