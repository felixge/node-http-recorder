var Socket = require('net').Socket;
var fs = require('fs');
var oop = require('oop');

oop.extend(HttpPlayer, Socket);
module.exports = HttpPlayer;

function HttpPlayer() {
  Socket.call(this);

  this._connectArgs = null;
  this._files = [];
  this._cb = null;
};

HttpPlayer.create = function() {
  var player = new this();
  player._connectArgs = Array.prototype.slice.call(arguments);
  return player;
};

HttpPlayer.prototype.add = function(file) {
  this._files.push.apply(this._files, arguments);
};

HttpPlayer.prototype.play = function(cb) {
  this._cb = cb;
  this._connectArgs.push(this._sendNext.bind(this));

  this.connect.apply(this, this._connectArgs);
};

HttpPlayer.prototype._sendNext = function() {
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

HttpPlayer.prototype._next = function() {
  var stream = this._files.shift();

  if (typeof stream === 'string') {
    var path = stream;
    stream = fs.createReadStream(path);
  }

  return stream;
};
