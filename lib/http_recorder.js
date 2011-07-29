var http = require('http');
var oop = require('oop');
var HttpRecord = require('./http_record');

module.exports = HttpRecorder;
oop.extend(HttpRecorder, http.Server);

function HttpRecorder() {
  http.Server.call(this);

  this._dir = null;
  this._port = 8080;
  this._records = [];
};

HttpRecorder.HttpPlayer = require('./http_player');

HttpRecorder.create = function(dir) {
  var recorder = new this();
  recorder._dir = dir || '.';
  recorder.init();
  return recorder;
};

HttpRecorder.prototype.init = function() {
  this
    .on('connection', this._handleConnection.bind(this))
    .on('request', this._handleRequest.bind(this));
};

HttpRecorder.prototype.listen = function(port, cb) {
  this._port = port || this._port;

  return http.Server.prototype.listen.call(this, this._port, cb);
};

HttpRecorder.prototype.getPort = function() {
  return this._port;
};

HttpRecorder.prototype.getDir = function() {
  return this._dir;
};

HttpRecorder.prototype._handleConnection = function(socket) {
  this._startNewRecord(socket);
  socket.on('end', function() {
    // Remove the last record we started as there will be no more requests
    // coming through this socket.
    var record = this._getRecord(socket);
    this._records.splice(this._records.indexOf(record), 1);
  }.bind(this));
};

HttpRecorder.prototype._startNewRecord = function(socket) {
  var record = HttpRecord.create(socket);
  this._records.push(record);
};

HttpRecorder.prototype._handleRequest = function(req, res) {
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

HttpRecorder.prototype._getRecord = function(request) {
  return this._records
    .filter(function(record) {
      return record.usesSocket(request.socket);
    })
    [0];
};
