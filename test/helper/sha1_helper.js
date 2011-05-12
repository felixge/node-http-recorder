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

exports.compare = function(fixtures, results) {
  for (var i in fixtures) {
    var fixture = fixtures[i];
    var result = results[i];

    exports.sha1File(fixture, function(err, fixtureSha1) {
      exports.sha1File(result, function(err, resultSha1) {
        if (fixtureSha1 !== resultSha1) {
          return;
        }

        throw new Error('Sha1 mismatch: ' + fixtureSha1 + ' !== ' + resultSha1);
      });
    });
  }
};
