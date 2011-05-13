var exec = require('child_process').exec;
var crypto = require('crypto');
var fs = require('fs');

exports.sha1File = function(path, cb) {
  var sha1 = crypto.createHash('sha1');

  var file = fs.createReadStream(path);
  file
    .on('data', function(d) {
      sha1.update(d);
    })
    .on('end', function() {
      cb(null, sha1.digest('hex'));
    });
}

exports.assertSha1 = function(result, fixture) {
  exports.sha1File(fixture, function(err, fixtureSha1) {
    exports.sha1File(result, function(err, resultSha1) {
      if (fixtureSha1 === resultSha1) {
        return;
      }

      var message =
        'Sha1 mismatch: ' + resultSha1 + ' !== ' + fixtureSha1 + ' when ' +
        'comparing ' + result + ' with ' + fixture;
      throw new Error(message);
    });
  });
};
