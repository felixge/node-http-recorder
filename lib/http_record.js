var Stream = require('stream').Stream;
var oop = require('oop');
var fs = require('fs');

var Class = module.exports = HttpRecord;
var SuperClass = Stream;
oop.extend(Class, SuperClass);
var Instance = Class.prototype;
var SuperInstance = SuperClass.prototype;

function HttpRecord() {
  SuperClass.call(this);

  this._file = null;
  this._path = null;
  this._buffering = true;
  this._buffers = [];
  this._socket;
};

Class.create = function(socket) {
  var record = new this();
  record.start(socket);
  return record;
};

Instance.start = function(socket) {
  this._socket = socket;

  socket.on('data', this._handleData.bind(this));
};

Instance._handleData = function(buffer) {
  if (this._buffering) {
    this._buffers.push(buffer);
    return;
  }

  this.emit('data', buffer);
};

Instance.usesSocket = function(socket) {
  return this._socket === socket;
};

Instance.isBuffering = function() {
  return this._buffering;
};

Instance.save = function(path) {
  this._path = path;
  this._file = fs.createWriteStream(path);
  this.pipe(this._file);

  this._buffers.forEach(function(buffer) {
    this.emit('data', buffer);
  }.bind(this));

  this._buffers = null;
  this._buffering = false
};

Instance.end = function(cb) {
  this._socket.removeAllListeners('data');
  this._socket = null;
  this.emit('end');
  this._file.on('close', cb);
};

Instance.getPath = function() {
  return this._path;
};
