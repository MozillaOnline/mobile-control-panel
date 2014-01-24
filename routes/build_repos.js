/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var mt = require('../mozharness_task');
var zhCnMirror = mt.zhCnMirror;

exports.getTask;
/**
 * Get zh-CN-mirror task status.
 * @return { state: {String},
 *           progress: {Number},
 *           lastUpdated: {Date}
 *         }. The state can be either of
 * 'updated',
 * 'outofdate',
 * 'error',
 * 'running'.
 * If it is in the state of 'running', the progress value is range from 0 to 100/
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

exports.getProgressDetail = function(req, res) {
    /*
  var result = {};
  if (zhCnMirror.isRunning()) {
    result.actions = zhCnMirror.getActions();
    result.currentAction = zhCnMirror.getCurrentAction();
  } else {
    
  }
  */
  name = 'zh-CN-mirror';
  dataClass = 'raw';
  var result = {};
  var rawLogFile = path.resolve(__dirname, '../workspace/logs/' + name + '_' + dataClass +'.log');
  var cmdline = 'grep -E "^#{5}\\s(\\S+\\s){2}step" "' + rawLogFile + '"';
  var currentAction = 'prepare';
  var actionsJson = {};
  var result = {};
  actionsJson["step0"] = "prepare";
  exec(cmdline, function(error, stdout, stderr) {
    if (error) {
      console.info('exec |' + cmdline + '| error: ' + error);
      return;
    }

    var matches = stdout.match(/(\S+)\sstep\./g);
    for (var i=0; i<matches.length; i++) {
      var curStep = matches[i];
      var parse_result = curStep.match(/(\S+)\sstep\./);
      var stepName = parse_result[1];
      currentAction = stepName;
      actionsJson["step"+(i+1)] = stepName;
    }

    result.actions = actionsJson;
    result.currentAction = currentAction;
    res.json(result);
  });
};


