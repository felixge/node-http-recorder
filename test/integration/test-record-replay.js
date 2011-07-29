var common = require('../common');
var assert = common.assert;
var HttpRecorder = require(common.dir.lib + '/http_recorder');
var HttpPlayer = require(common.dir.lib + '/http_player');
var sha1Helper = require(common.dir.helper + '/sha1_helper');

common.cleanTmpFiles();

var fixtures = [
  common.dir.fixture + '/keep-alive-1.http',
  common.dir.fixture + '/keep-alive-2.http',
  common.dir.fixture + '/multipart.http',
];

var recorder = HttpRecorder.create(common.dir.tmp);
recorder.listen(common.port, function() {
  var player = HttpPlayer.create(common.port);

  player.add.apply(player, fixtures);

  player.play(function(err) {
    if (err) {
      throw err;
    }

    recorder.close();
  });
});

var i = 0;
recorder.on('record', function(record) {
  var fixture = fixtures[i];

  sha1Helper.assertSha1(record.getPath(), fixture);

  i++;
});

process.on('exit', function() {
  assert.strictEqual(i, fixtures.length);
});
