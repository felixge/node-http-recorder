#!/usr/bin/env coffee
HttpRecorder = require '..'

recorder = new HttpRecorder

port = process.argv[2]
dir = process.cwd()

recorder.record port, dir
