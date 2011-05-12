var common = require('../common');
var HttpRecorder = require(common.dir.lib + '/http_recorder');
var HttpPlayer = require(common.dir.lib + '/http_player');
var sha1Helper = require(common.dir.helper + '/sha1_helper');

common.cleanTmpFiles();

var fixtures = [
  common.dir.fixture + '/keep-alive-1.http',
  common.dir.fixture + '/keep-alive-2.http',
  common.dir.fixture + '/multipart.http',
];

var results = [
  common.dir.tmp + '/result_1.http',
  common.dir.tmp + '/result_2.http',
  common.dir.tmp + '/result_3.http',
];


var recorder = HttpRecorder.create(common.dir.tmp);
recorder.listen(common.port, function() {
  var player = HttpPlayer.create(common.port);

  player.add.apply(player, fixtures);

  player.end(function(err) {
    if (err) {
      throw err;
    }

    recorder.close();

    sha1Helper.compare(fixtures, results);
  });
});
