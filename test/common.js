var common = module.exports;
var path = require('path');
var fs = require('fs');

var rootDir = path.join(__dirname, '..');
common.dir = {
  lib: rootDir + '/lib',
  tmp: rootDir + '/test/tmp',
  fixture: rootDir + '/test/fixture',
  helper: rootDir + '/test/helper',
};

common.port = 8080;

common.assert = require('assert');

common.listTmpFiles = function() {
  var dir = common.dir.tmp;
  var files = fs.readdirSync(dir);

  return files
    .filter(function(name) {
      return name.match(/\.http$/);
    })
    .map(function(name) {
      var path = dir + '/' + name;
      return path;
    });
}

common.cleanTmpFiles = function() {
  this
    .listTmpFiles()
    .map(fs.unlinkSync);
};
