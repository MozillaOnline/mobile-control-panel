/**
 * Module dependencies.
 */

var fs = require('fs');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var path = require('path');

exports.MozharnessTask = MozharnessTask;

function MozharnessTask(name, scriptFile, configFile, actions) {
  this._scriptFile = path.resolve(__dirname, '../workspace/mozharness/scripts', scriptFile);
  this._configFile = path.resolve(__dirname, '../workspace/mozharness/configs', configFile);
  this.name = name;
  this.actions = actions;
  this._childProcess = null;
  this._currentAction = 'prepare';
  this._isError = false;
}

util.inherits(MozharnessTask, EventEmitter);

MozharnessTask.prototype.init = function(callback) {
  this._checkFailErrors(function() {
    this._checkCurrentAction(function() {
      if (callback) {
        callback();
      }
    });
  }.bind(this));
};

MozharnessTask.prototype.run = function() {
  if (this._childProcess) {
    // It is already started.
    return;
  }
  this._isError = false;
  this._currentAction = 'prepare';
  this.emit('start');
  var child = spawn('python', [
    this._scriptFile,
    '--config-file',
    this._configFile
  ], {
    cwd: path.resolve(__dirname, '../workspace')
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function(err) {
    // Can't run the python script.
    if (err.indexOf("python: can't open file") != -1) {
      var data = new Date().toTimeString().substr(0, 8) + '    FATAL - ' + err;
      var dir = path.resolve(__dirname, '../workspace/logs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      var filename = path.resolve(dir, this.name + '_fatal.log');
      fs.appendFile(filename, data, function(err) {
        if (err) {
          console.info(err);
        }
      });
      filename = path.resolve(__dirname, '../workspace/logs/' + this.name + '_info.log');
      fs.appendFile(filename, data, function(err) {
        if (err) {
          console.info(err);
        }
      });
      this._childProcess = null;
      this._isError = true;
      this.emit('stop');
      return;
    }

    // All mozharness log will be output via stderr, so we have to watch here.

    // Search current action. The line to report current action will be like
    // 02:53:08     INFO - ##### Running push step.
    console.log(err);
    var matches = err.match(/(\S+)\sstep\.\n/);
    if (matches && matches.length >= 2) {
      this._currentAction = matches[1];
      this.emit('state_change');
    }
  }.bind(this));

  child.on('close', function(code) {
    this._childProcess = null;
    this.emit('stop');
  }.bind(this));

  this._childProcess = child;
};

MozharnessTask.prototype.isRunning = function() {
  return this._childProcess != null;
};

MozharnessTask.prototype.getActions = function() {
  return this.actions;
}

MozharnessTask.prototype.isError = function() {
  return this._isError;
};

MozharnessTask.prototype.getCurrentAction = function() {
  return this._currentAction;
};

// Check the log files to see if there exits fatal errors.
MozharnessTask.prototype._checkFailErrors = function(callback) {
  var fatalLogFile = path.resolve(__dirname, '../workspace/logs/' + this.name + '_fatal.log');
  fs.stat(fatalLogFile, function(err, stats) {
    if (!err && stats.size > 0) {
      this._isError = true;
    } else {
      this._isError = false;
    }
    if (callback) {
      callback();
    }
  }.bind(this));
};

MozharnessTask.prototype._checkCurrentAction = function(callback) {
  var rawLogFile = path.resolve(__dirname, '../workspace/logs/' + this.name + '_raw.log');
  // Search the log file to find lines similar to following
  // ##### Skipping clobber step.
  // ##### Running push step.
  // ##### Running notify step.
  var cmdline = 'grep -E "^#{5}\\s(\\S+\\s){2}step" "' + rawLogFile + '"';
  exec(cmdline, function(error, stdout, stderr) {
    this._currentAction = 'prepare';
    if (error) {
      console.info('exec |' + cmdline + '| error: ' + error);
      if (callback) {
        callback();
      }
      return;
    }
    // The last line of the stdout will be like:
    // ##### XXX ACTION_NAME step.
    var matches = stdout.match(/(\S+)\sstep\./);
    if (matches && matches.length >= 2) {
      this._currentAction = matches[1];
    }
    if (callback) {
      callback();
    }
  }.bind(this));
};
