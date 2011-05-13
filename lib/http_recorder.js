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
  this._port = 8080;
  this._records = [];
};

Class.HttpPlayer = require('./http_player');

Class.create = function(dir) {
  var recorder = new this();
  recorder._dir = dir || '.';
  recorder.init();
  return recorder;
};

Instance.init = function() {
  this
    .on('connection', this._handleConnection.bind(this))
    .on('request', this._handleRequest.bind(this));
};

Instance.listen = function(port, cb) {
  this._port = port || this._port;

  return SuperInstance.listen.call(this, this._port, cb);
};

Instance.getPort = function() {
  return this._port;
};

Instance.getDir = function() {
  return this._dir;
};

Instance._handleConnection = function(socket) {
  this._startNewRecord(socket);
  socket.on('end', function() {
    // Remove the last record we started as there will be no more requests
    // coming through this socket.
    var record = this._getRecord(socket);
    this._records.splice(this._records.indexOf(record), 1);
  }.bind(this));
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
      this.emit('record', record);

      res.writeHead(200);
      res.end(JSON.stringify({ok: 'request recorded', name: record.getName()}));
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
