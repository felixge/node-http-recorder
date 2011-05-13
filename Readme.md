# http-recorder

A tool to record and play back raw http requests. Multiple requests over a
single connection (Keep-Alive) are supported.

## Usage

This module ships with a simple http-recorder command line tool that takes
two optional arguments.

``` bash
http-recorder $PORT $DIRECTORY
```

`$PORT` defaults to 8080 and `$DIRECTORY` defaults to `process.cwd()`.

Once started, http-recorder listens for incoming connections, and stores the
raw incoming http data in files named `request_<id>.http`. `id` is an
integer starting at 1 that increments with each incoming request.

Alternatively, you can also use the module programatically.

``` javascript
var HttpRecorder = require('http-recorder');

var recorder = HttpRecorder.create(__dirname);
recorder.listen(1234);
recorder.on('record', function(record) {
  console.log('New record: %s', record.getPath());
});
```

Once you have one or more recorded http requests, you can use the `HttpPlayer`
for playing them back.

``` javascript
var HttpPlayer = require('http-recorder').HttpPlayer;
var player = HttpPlayer.create(common.port);

player.add('request_1.http', 'request_2.http');

player.end(function(err) {
  if (err) {
    throw err;
  }
});
```

Please note: The player is a very dumb http client. When calling
`player.end()`, it opens a single socket to the given port / host, and simply
pipes all files passed to `player.add()` sequentially into it. You are
responsible for figuring out if the host supports Keep-Alive or not.
