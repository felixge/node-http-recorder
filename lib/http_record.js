var Stream = require('stream').Stream;
var oop = require('oop');
var fs = require('fs');
var basename = require('path').basename;

module.exports = HttpRecord;
oop.extend(HttpRecord, Stream);

function HttpRecord() {
  Stream.call(this);

  this._file = null;
  this._path = null;
  this._buffering = true;
  this._buffers = [];
  this._socket;
};

HttpRecord.create = function(socket) {
  var record = new this();
  record.start(socket);
  return record;
};

HttpRecord.prototype.start = function(socket) {
  this._socket = socket;

  socket.on('data', this._handleData.bind(this));
};

HttpRecord.prototype._handleData = function(buffer) {
  if (this._buffering) {
    this._buffers.push(buffer);
    return;
  }

  this.emit('data', buffer);
};

HttpRecord.prototype.usesSocket = function(socket) {
  return this._socket === socket;
};

HttpRecord.prototype.isBuffering = function() {
  return this._buffering;
};

HttpRecord.prototype.save = function(path) {
  this._path = path;
  this._file = fs.createWriteStream(path);
  this.pipe(this._file);

  this._buffers.forEach(function(buffer) {
    this.emit('data', buffer);
  }.bind(this));

  this._buffers = null;
  this._buffering = false
};

HttpRecord.prototype.end = function(cb) {
  this._socket.removeAllListeners('data');
  this._socket = null;
  this.emit('end');
  this._file.on('close', cb);
};

HttpRecord.prototype.getPath = function() {
  return this._path;
};

HttpRecord.prototype.getName = function() {
  return basename(this._path);
};
