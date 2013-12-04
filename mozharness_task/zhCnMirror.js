/**
 * Module dependencies.
 */

var fs = require('fs');
var MozharnessTask = require('./task.js').MozharnessTask;
var server = require('../socket_server');
var path = require('path');

var zhCnMirror = new MozharnessTask('zh-CN-mirror',
                                    'vcs-sync/cn_vcs_sync.py',
                                    'vcs_sync/cn_zh-CN.py',
                                    ['prepare',
                                     'clobber',
                                     'create-virtualenv',
                                     'update-stage-mirror',
                                     'update-work-mirror',
                                     'push']);

zhCnMirror.init(function() {
  var filename = path.resolve(__dirname, '../workspace/build/upload/repo_update.json');
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.error('zhCnMirror.init: failed to read ' + filename);
      zhCnMirror.emit('state_change');
      return;
    }
    try {
      var json = JSON.parse(data);
      if (json && json['last_push_timestamp']) {
        zhCnMirror._lastUpdated = new Date(json['last_push_timestamp'] * 1000);
      }
    } catch (e) {
      console.error('zhCnMirror.init: ' + e);
    }
    zhCnMirror.emit('state_change');
  });
});

zhCnMirror.on('state_change', function() {
  server.broadcast('repo_state_change', 'zh-CN-mirror');
});

zhCnMirror.on('stop', function() {
  this.init();
});

zhCnMirror.getProgress = function() {
  var position = this.actions.indexOf(this.getCurrentAction());
  return Math.floor(position * 100 / this.actions.length);
};

zhCnMirror.getLastUpdated = function() {
  return this._lastUpdated || '';
};

exports.zhCnMirror = zhCnMirror;
