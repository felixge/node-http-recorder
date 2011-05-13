var http = require('http');
var oop = require('oop');
var HttpRecord = require('./http_record');

var Class = module.exports = HttpRecorder;
var SuperClass = http.Server;
oop.extend(Class, SuperClass);
var Instance = Class.prototype;
var SuperInstance = SuperClass.prototype;

function HttpRecorder() {
  SuperClass.call(this);

  this._dir = null;
  this._records = [];
};

Class.create = function(dir) {
  var recorder = new this();
  recorder._dir = dir || process.cwd();
  recorder.init();
  return recorder;
};

Instance.init = function() {
  this
    .on('connection', this._startNewRecord.bind(this))
    .on('request', this._handleRequest.bind(this));
};

Instance.listen = function(port, cb) {
  port = port || 8080;

  return SuperInstance.listen.call(this, port, cb);
};

Instance._startNewRecord = function(socket) {
  var record = HttpRecord.create(socket);
  this._records.push(record);
};

Instance._handleRequest = function(req, res) {
  var record = this._getRecord(req);
  if (!record) {
    var err = new Error('Could not find record object for request to: ' + req.url);
    this.emit('error', err);
    return;
  }

  req.on('end', function() {
    record.end(function() {
      this.emit('record', record.getPath());

      res.writeHead(200);
      res.end(JSON.stringify({ok: 'request received'}));
    }.bind(this));

    this._startNewRecord(req.socket);
  }.bind(this));

  var fileName = 'request_' + this._records.length + '.http';
  var path = this._dir + '/' + fileName;
  record.save(path);
};

Instance._getRecord = function(request) {
  return this._records
    .filter(function(record) {
      return record.usesSocket(request.socket);
    })
    [0];
};
