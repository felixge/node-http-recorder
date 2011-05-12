var Socket = require('net').Socket;
var fs = require('fs');
var oop = require('oop');

var Class = module.exports = HttpPlayer;
var SuperClass = Socket;
oop.extend(Class, SuperClass);
var Instance = Class.prototype;
var SuperInstance = SuperClass.prototype;

function HttpPlayer() {
  SuperClass.call(this);

  this._connectArgs = null;
  this._files = [];
  this._cb = null;
};

HttpPlayer.create = function() {
  var player = new this();
  player._connectArgs = Array.prototype.slice.call(arguments);
  return player;
};

Instance.add = function(file) {
  this._files.push.apply(this._files, arguments);
};

Instance.end = function(cb) {
  this._cb = cb;
  this._connectArgs.push(this._sendNext.bind(this));

  this.connect.apply(this, this._connectArgs);
};

Instance._sendNext = function() {
  var stream = this._next();
  if (!stream) {
    this.destroy();
    this._cb(null);
    return;
  }

  stream.pipe(this, {end: !this._files.length});
  stream.on('end', function() {
    this._sendNext();
  }.bind(this));
};

Instance._next = function() {
  var stream = this._files.shift();

  if (typeof stream === 'string') {
    var path = stream;
    stream = fs.createReadStream(path);
  }

  return stream;
};
