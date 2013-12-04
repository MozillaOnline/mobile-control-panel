/**
 * Module dependencies.
 */

var mt = require('../mozharness_task');
var zhCnMirror = mt.zhCnMirror;

/**
 * Get zh-CN-mirror task status.
 * @return { state: {String},
 *           progress: {Number},
 *           action: {String},
 *           lastUpdated: {Date}
 *         }. The state can be either of
 * 'updated',
 * 'outofdate',
 * 'error',
 * 'running'.
 * If it is in the state of 'running', the progress value is range from 0 to 100,
 * the action field is current running action.
 */
exports.getZhCnMirrorStatus = function(req, res) {
  var lastUpdated = zhCnMirror.getLastUpdated();
  var result = {
    state: 'outofdate',
    lastUpdated: lastUpdated
  };

  if (zhCnMirror.isRunning()) {
    result.state = 'running';
    result.progress = zhCnMirror.getProgress();
    result.action = zhCnMirror.getCurrentAction();
    res.json(result);
    return;
  }

  if (zhCnMirror.isError()) {
    result.state = 'error';
    res.json(result);
    return;
  }

  if (lastUpdated) {
    // If we update the repo within 1 days, the repo is up to date.
    if (Date.now() - lastUpdated < 24 * 3600 * 1000) {
      result.state = 'updated';
    }
  }

  res.json(result);
};

exports.startZhCnMirrorTask = function(req, res) {
  if (!zhCnMirror.isRunning()) {
    zhCnMirror.run();
  }
  res.json({});
};
