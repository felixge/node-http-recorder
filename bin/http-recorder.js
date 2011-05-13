#!/usr/bin/env node
var HttpRecorder = require('..');
var recorder = HttpRecorder.create(process.argv[3]);
recorder.listen(process.argv[2]);
