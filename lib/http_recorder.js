var http = require('http');
var oop = require('oop');
var fs = require('fs');
var HttpRecord = require('./http_record');

var Class = module.exports = HttpRecorder;
var SuperClass = http.Server;
oop.extend(Class, SuperClass);
var Instance = Class.prototype;
var SuperInstance = SuperClass.prototype;

function HttpRecorder() {
  SuperClass.call(this);

  this._records = [];
};

Class.create = function() {
  var recorder = new this();
  return recorder;
};

Class.writeToDirectoryHandler = function(dir) {
  dir = dir || process.cwd();

  var count = 0;

  return function(record) {
    count++;
    var fileName = 'request_' + count + '.http';
    var path = dir + '/' + fileName;
    var file = fs.createWriteStream(path);

    record.pipe(file);
  }.bind(this);
};

Instance.init = function() {
  this
    .on('connection', this._handleConnection.bind(this))
    .on('request', this._handleRequest.bind(this));
};

Instance.listen = function(port, cb) {
  port = port || 8080;

  return SuperInstance.listen.call(this, port, cb);
};

Instance._handleConnection = function(socket) {
  this._addRecord(socket);
};

Instance._addRecord = function(socket) {
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
    record.close();

    res.writeHead(200);
    res.end(JSON.stringify({ok: 'request received'}));

    this._addRecord(req.socket);
  }.bind(this));


  this.emit('record', record);
  record.stopBuffering();
};

Instance._getRecord = function(request) {
  return this._records
    .filter(function(record) {
      return record.usesSocket(request.socket);
    })
    [0];
};
