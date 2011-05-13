#!/usr/bin/env node
var HttpRecorder = require('..');

var recorder = HttpRecorder.create(process.argv[3]);

recorder.listen(process.argv[2], function() {
  console.log(
    'Listening on port %s, recording into: %s',
    recorder.getPort(),
    recorder.getDir()
  );
});

recorder.on('record', function(record) {
  console.log('Recorded ' + record.getName());
});

var connectionId = 0;
recorder.on('connection', function(socket) {
  connectionId++;
  (function(connectionId) {
    console.log('-> Connection #%s', connectionId);

    socket.on('end', function() {
      console.log('<- Connection #%s', connectionId);
    });
  })(connectionId);
});
